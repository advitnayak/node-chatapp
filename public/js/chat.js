const socket = io()
//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $sendLocationButton=document.querySelector('#send_location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessageTemplate=document.querySelector("#locatio-nmessage-template")
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username,room} = Qs.parse(location.search,{"ignoreQueryPrefix":true})
const autoscroll= ()=>{
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight

    //visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of Message container
    const containerHeight = $messages.scrollHeight

    //How far I have scrolled
    const scrollOffset=$messages.scrollTop+visibleHeight

    if((containerHeight - newMessageHeight) <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        "username":message.username,
        "message":message.text,
        "createdAt": moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmessage',(message)=>{
    const html = Mustache.render(locationmessageTemplate,{
        "username":message.username,
        "url":message.url,
        "createdAt":moment(message.createdAt).foirmat("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomdata',({"room":room,"users":users})=>{
    const html = Mustache.render(sidebarTemplate,{
        "room":room,
        "username":username
    })
    document.querySelector("#sidebar").innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    //disable
    // const message = document.querySelector('#message').value
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =''
        $messageFormInput.focus()
        //enable
        if (error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})

// socket.on('countUpdated',(count)=>{
//     console.log("The count has been updated",count)
// })

// document.querySelector("#increment").addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })  

$sendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation){
        return alert('Geo Loaction is Not supported by browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            'latitude':position.coords.latitude,
            'longitude':position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})