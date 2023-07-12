const APP_ID="856e69db3f5745d2a9a1a00db91b1910"
const TOKEN="007eJxTYNg14V5rDdfyHZFMl1Y5SSTwOKp5TYl4X9zaz/NMh03z0RcFBgtTs1Qzy5Qk4zRTcxPTFKNEy0TDRAODlCRLwyRDS0ODuaHrUhoCGRlEvs1nZWSAQBCfhSE3MTOPgQEA6aweNA=="
const CHANNEL="main"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks =[]
let remoteUsers ={}

let joinAndDisplayLocalStream = async () => {
    client.on('user-published',handleUserJoined)
    client.on('user-left',handleUserLeft)


    let UID = await client.join(APP_ID,CHANNEL,TOKEN,null)

    localTracks=await AgoraRTC.createMicrophoneAndCameraTracks()

    let player=`<div class="video-container" id="user-container-${UID}">
                   <div class="video-player" id="user-${UID}"></div>
                </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0],localTracks[1]])
}

let joinStream=async()=>{
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display='none'
    document.getElementById('stream-controls').style.display='flex'
}

let handleUserJoined= async(user, mediaType) =>{
    remoteUsers[user.uid] = user
    await client.subscribe(user,mediaType)

    if(mediaType=== 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div>        
        </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType === `audio`){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user)=> {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i=0;localTracks.length>i;i++){
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
    document.getElementById('join-btn').style.display='block'
    document.getElementById('stream-controls').style.display='none'
    document.getElementById('video-streams').innerHTML = ''

}

let toggleMic = async (e) =>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor= 'rgba(6, 30, 168, 0.566)'
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor= 'rgb(148, 15, 5)'
    }
}

let toggleCamera = async(e) =>{
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor= 'rgba(6, 30, 168, 0.566)'
    }
    else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor= 'rgb(148, 15, 5)'
    }
}

document.getElementById('join-btn').addEventListener('click',joinStream)
document.getElementById('leave').addEventListener('click',leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click',toggleMic)
document.getElementById('camera-btn').addEventListener('click',toggleCamera)