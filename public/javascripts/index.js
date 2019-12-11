var lastRetrievalDate,
    timer,
    delay = 100000000;
function createElement(type, classObj={}, text=undefined, node1=undefined, node2=undefined) {
  const div = document.createElement(type);
  if (text) {
    const content = document.createTextNode(text);
    div.appendChild(content);
  }
  if (node1) {
    div.appendChild(node1);
  }
  if (node2) {
    div.appendChild(node2);
  }
  for (const id in classObj) {
    div.setAttribute(id, classObj[id]);
  }
  return div;
}

function sendMessage(message, slug) {
  //console.log('sending message', message);
  const req= new XMLHttpRequest();
  req.open('POST', 'http://localhost:3000/chat/' + slug + '/send', true);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  req.send('text=' + message);
  req.addEventListener('load', function(evt) {
    clearTimeout(timer);
    getMessages(slug);
  });
}

function getMessages(slug) {
  var req = new XMLHttpRequest(),
  url = 'http://localhost:3000/chat/'+ slug + '/send';
  console.log("slug isis", slug);
  req.open('GET', url, true);

  req.addEventListener('load', function() {
    if (req.status >= 200 && req.status < 400){
      data = JSON.parse(req.responseText);
      messageWrapper = document.getElementById('message-wrapper');
      console.log("node1",messageWrapper.childNodes);
      const messageWrapper.removeChild(messageWrapper.childNodes[1]);
      const messageList = createElement('div', {id: 'message-list'});
      const messageWrapper.appendChild(messageList);
      //data.forEach(function(msg) {
        //let newele = createElement('div', {class: 'message-content'}, msg.time + ' - ' + msg.text + ' sent by ' + msg.sender_name);
        //let div = messageList.appendChild(newele);
      //});
      for (let i = 0; i < data.length; i++) {
        const newele = createElement('div', {class: 'message-content'}, data[i].time + ' - ' + data[i].text + ' sent by ' + data[i].sender_name);
        const div = messageList.appendChild(newele);
      }
      //console.log(data);
      console.log("node2",messageWrapper.childNodes);
      //messageWrapper.removeChild(messageWrapper.childNodes[2]);
      timer = setTimeout(getMessages(slug), 100000);
    } else {
      console.log(req.status);
    }
  });
  req.addEventListener('error', function() {
    console.log('uh-oh... network error or cross domain request');
  });

  req.send();
}

function main() {
  const sendButton = document.getElementById('send-message-button');
  const slug = document.getElementById('chat-id').value;
  sendButton.addEventListener('click', function(evt) {
    const sendMessageBox = document.getElementById('send-message-box');
    const message = sendMessageBox.value;
    sendMessageBox.value = "";
    evt.preventDefault();
    sendMessage(message, slug);
  });
}

document.addEventListener("DOMContentLoaded", main);