//Connecting to database
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";


  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
  apiKey: "AIzaSyDGvikwmNq-xCwbB7yH7l4rtLrlS5_JZ20",
  authDomain: "crappy-chat-app.firebaseapp.com",
  databaseURL: "https://crappy-chat-app-default-rtdb.firebaseio.com",
  projectId: "crappy-chat-app",
  storageBucket: "crappy-chat-app.appspot.com",
  messagingSenderId: "908860015383",
  appId: "1:908860015383:web:300652f49a6724002f6d52",
  measurementId: "G-JRN4FS2DZW"
  };

// Initialize Firebase and Variables
const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);
let auth = fbauth.getAuth(app);
let chatRef = rtdb.ref(db, "/");
//let chatRef = rtdb.ref(db, "/chats/messageID/message");
let chats = rtdb.child(chatRef, "chats");
let users = rtdb.child(chatRef, "users" );

//renderUser function
let renderUser = function(usrObj){
  let id = usrObj.uid;
  let userRef = rtdb.ref(db, `/users/${id}/userName`);
  rtdb.get(userRef).then(ss=>{
    $("#Userdisplay").html(ss.val());
  });
  $("#Logout").on("click", ()=>{
    fbauth.signOut(auth);
    alert("Logged Out");
  });
}

fbauth.onAuthStateChanged(auth, user=>{
  if (!!user){
    $("#Login").hide();
    renderUser(user);
    $("#LoggedIn").show();
    $("#part1").show();
    $("#chat").show;
  }
  else{
    $("#Login").show();
    $("#Userdisplay").html("");    
    $("#LoggedIn").hide();
    $("#part1").hide();
    $("#chat").hide;
  };
});

$("#Register").on("click", ()=>{
  let email = $("#RegisterEmail").val();
  let password = $("#Password").val();
  let reenterPassword = $("#ReenterPassword").val();
  if(password != reenterPassword){
    alert("Passwords do not match. Please try again.")
    return;
  }
  // else if(password.value.length > 6){
  //   alert("Password is too short. Try again");
  //   return;
  // }
  fbauth.createUserWithEmailAndPassword(auth, email, password).then(datahere=>{
    let id = datahere.uid;
    let userName = $("#UserName").val();
    let userRoleRef = rtdb.ref(db, `/users/${id}/roles/user`);
    let usernameRef = rtdb.ref(db, `/users/${id}/username`);
    let newAcctRef = rtdb.ref(db, `/users/${id}/roles/newacct`);
    let adminRef = rtdb.ref(db, `/users/${id}/roles/admin`);
    rtdb.set(userRoleRef, true);
    rtdb.set(newAcctRef, true);
    rtdb.set(usernameRef, userName);
    rtdb.set(adminRef, false);
    rtdb.set(newAcctRef, false);
    rtdb.get(usernameRef).then(ss=>{
      $("#Userdisplay").html(ss.val());
    });
  }).catch(function(error){
    //Error Handler
    var errorCode = error.code;
    var errorMsg = error.message;
    console.log(errorCode);
    console.log(errorMsg);
  });
});

$("#Login").on("click", ()=>{
  let email = $("#LoginEmail").val();
  let password = $("#LoginPassword").val();
  fbauth.signInWithEmailAndPassword(auth, email, password).then(datahere=>{
    let id = datahere.user.userID;
    let usernameRef = rtdb.ref(db, `/users/${id}/username`);
    rtdb.get(usernameRef).then(ss=>{
      $("#Userdisplay").html(ss.val());
    });
    
  }).catch(function(error){
    //Error Handler
    var errorCode = error.code;
    var errorMsg = error.message;
    console.log(errorCode);
    console.log(errorMsg);    
  });
});

let clickHandlerMsg = function(){
  let message = $("#Message").val();
  let username = $("#Userdisplay").text();
  let currentTime = Date().valueOf();
  let chatmsg = { 
    User: username,
   // UserId: userId //TODO
    message: message,
    time: currentTime,
    edited: false
  };
  rtdb.push(chats, chatmsg);
}

let clickHandlerEdit = function(target){
  let currentTarget = target.currentTarget;
  let currentID = $(currentTarget).attr("data-id");
  let msg = this.innerHTML;
  let ind = msg.indexOf(":");
  let msgUser = msg.slice(0, ind);
  let username = $("#Userdisplay").text();
  if(username == msgUser){
    let edit = window.prompt("Edit your message", "");
    this.innerHTML = username + ':"' + edit + '"';
    let message = rtdb.ref(db, "chats/" + currentID + "/message");
    let editbool = rtdb.ref(db, "chats/" + currentID + "/message/edited")
    rtdb.set(editbool,"true")
  }
  else{
    alert("You don't have privileges to edit this message");
  }
}

let makeAdmin = function(target){
  let currentTarget = target.currentTarget;
  let currentID = $(currentTarget).attr("data-id");
  let adminRoleRef = rtdb.red(db, `/users/${currentID}/roles/admin`);
  rtdb.set(adminRoleRef, true);
}

let killAdmin = function(target){
  let currentTarget = target.currentTarget;
  let currentID = $(currentTarget).attr("data-id");
  let adminRoleRef = rtdb.red(db, `/users/${currentID}/roles/admin`);
  rtdb.set(adminRoleRef, false);
}

rtdb.onValue(users, ss=>{
  //$("#userLog").empty();
  let value = ss.val();
  if(value == null){
    value = "";
  }
  //if (value != null){
  let id = Object.keys(value);
  id.map((anId)=>{
    let user = JSON.stringify(value[anId].username);
    let input = user.replace(/"/g, '');
    $("#userLog").append(
       `<div class="user" data-id=${anId}>${userinput}</div> <button type="button" class="makeAdmin" data-id=${anId}>Make Admin</button> <button type="button" class="killAdmin" data-id=${anId}>Kill Admin</button>`
    );
  });
  $(".makeAdmin").click(makeAdmin);
  $(".killAdmin").click(killAdmin);    
    //renderChats(value);
});

rtdb.onValue(chats, ss=>{
  $("#chatsLog").empty();
  let value = ss.val();
  if (value != null){
    let msgid = Object.keys(value);
    msgid.map((anId)=>{
      let msg = JSON.stringify(value[anId].message);
      let user = JSON.stringify(value[anId].User);
      let input = user.replace(/"/g, '');
      $("#chatsLog").append(
        `<div class="message" data-id=${anId}>${input + ":" + msg}</div>`
      );
    });
    $(".message").click(clickHandlerEdit);
    //renderChats(value);
  };
});

let clickHandlerClr = function(){
  let message = $("#message").val();
  rtdb.set(chats, []);
  $("#chatsLog").html("No Messages Here");
}

$("#SendMessage").click(clickHandlerMsg);
$("#Clear").click(clickHandlerClr);


// //renderChats function
// let renderChats = function(msg){
//   $("#chats").empty();
//   let id = Object.keys(msg);
//   $("#chats").html("");
//   id.map(anid=>{
//     let msgObj = msg[anid];
//     $("#chats").append(
//       `<div class="msg" data-id=${anid}>${msgObj.msg} ${msgObj.edited ? "<span>(edited)</span>" : ""}</div>`
//       //`<li>${msg[anid]}</li>`
//     );
//   });
//   $(".msg").click(clickHandlerMsg);
//  }

// let clickHandlerButton = function(){
//   let message = $("#message").val();
//   rtdb.push(chatRef,message);
// }

// $("#send").click(clickHandlerButton);

// let clickHandlerMsg = function(evt){
//   let clickedElement = evt.currentTarget;
//   let idFromDOM = $(clickedElement).attr("data-id");
//   $(clickedElement).after(`
//     <input type="text" 
//       data-edit=${idFromDOM} 
//       class="msgedit" 
//       placeholder="Edit Your message"/>
//     <button data-done=${idFromDOM}>Send Edit</button>`);
//   $(`[data-done=${idFromDOM}]`).on("click", (evt)=>{
//     let editedMsg = $(`[data-edit=${idFromDOM}]`).val();
//     sendEdit(idFromDOM, editedMsg, myUserID);
//     $(`[data-edit=${idFromDOM}]`).remove();
//     $(`[data-done=${idFromDOM}]`).remove();
//   });
// }

// let sendEdit = function(msgid, msgup, userid){
//   console.log(msgid, msgup, userid);
//   //let chatsRef = "fake";
//   let msgRef = rtdb.child(chatRef, msgid);
//   rtdb.update(msgRef, {"edited": true, "msg": msgup});
  
// }

