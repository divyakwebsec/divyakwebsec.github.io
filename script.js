//Connecting to database
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";


  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDf6SQ-OZagcdhojW8pmpe3tnUy1tWJA8I",
    authDomain: "baby-discord.firebaseapp.com",
    projectId: "baby-discord",
    storageBucket: "baby-discord.appspot.com",
    messagingSenderId: "14251493040",
    appId: "1:14251493040:web:9eeb12d3d4ef7ca70a5d75"
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
  let adminRef = rtdb.ref(db, `/users/${id}/roles/admin`);
  let signedinRef = rtdb.ref(db, `/users/${id}/signedin`);
  rtdb.set(signedinRef, true);
  rtdb.get(userRef).then(ss=>{
    $("#Userdisplay").html(ss.val());
  });
  rtdb.get(signedinRef).then(ss=>{
    if(ss.val()==true){
      $("#signedOn").append(
        $("#Userdisplay").html(ss.val())
      )
    }
  });
  rtdb.get(adminRef).then(ss=>{
    if (ss.val()==true){
      //$("#AdminDisplay").show();
      $(".makeAdmin").show();
      $(".killAdmin").show();
      $("#Clear").show();
      document.getElementById("Clear").disabled = false;
    }
    else {
      //$("#AdminDisplay").hide();
      $(".makeAdmin").hide();
      $(".killAdmin").hide();
      $("#Clear").show();
      document.getElementById("Clear").disabled = true;
    }
  });
  $("#Logout").on("click", ()=>{
    fbauth.signOut(auth);
    rtdb.set(signedinRef, false);
    $("#signedOn").remove(
       $("#Userdisplay").html("")
    )
  });
}

fbauth.onAuthStateChanged(auth, user=>{
  if (!!user){
    $("#LoginPage").hide();
    renderUser(user);
    $("#LoggedIn").show();
    $("#GroupChat").show();
    $("#UserLogs").show();
    $("#Online").show();
  }
  else{
    $("#LoginPage").show();
    clickHandlerRegisterPage();    
    $("#Userdisplay").html("");    
    $("#LoggedIn").hide();
    $("#GroupChat").hide();
    $("#UserLogs").hide();
    $("#Online").hide();
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
  fbauth.createUserWithEmailAndPassword(auth, email, password).then((userCredentials)=>{
    let id = userCredentials.user.uid;
    let userName = $("#UserName").val();
    let userRoleRef = rtdb.ref(db, `/users/${id}/roles/user`);
    let usernameRef = rtdb.ref(db, `/users/${id}/username`);
    let newAcctRef = rtdb.ref(db, `/users/${id}/roles/newacct`);
    let adminRef = rtdb.ref(db, `/users/${id}/roles/admin`);
    let signedInRef = rtdb.ref(db, `/users/${id}/signedin`);
    rtdb.set(userRoleRef, true);
    rtdb.set(newAcctRef, true);
    rtdb.set(usernameRef, userName);
    rtdb.set(adminRef, false);
    rtdb.set(signedInRef,true);
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
  $(".makeAdmin").hide();
  $(".killAdmin").hide();
  
  fbauth.signInWithEmailAndPassword(auth, email, password).then(userCredentials=>{
    let uid = userCredentials.user.uid
    let usernameRef = rtdb.ref(db, `/users/${uid}/username`);
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
    // if(edit == null){
    //   edit = msgVal;
    // }
    this.innerHTML = username + ':"' + edit + '"';
    let message = rtdb.ref(db, "chats/" + currentID + "/message");
    let editbool = rtdb.ref(db, "chats/" + currentID + "/edited")
    rtdb.set(editbool, true)
    rtdb.set(message,edit)
  }
  else{
    alert("You don't have privileges to edit this message");
  }
}

let makeAdmin = function(target){
  let currentTarget = target.currentTarget;
  var currentID = $(currentTarget).attr("data-id");
  let adminRoleRef = rtdb.ref(db, `/users/${currentID}/roles/admin`);
  rtdb.get(adminRoleRef).then(ss=>{
    if (ss.val() != true){
      rtdb.set(adminRoleRef, true);
      alert("You made an admin");
    }
  });
}

let killAdmin = function(target){
  let currentTarget = target.currentTarget;
  var currentID = $(currentTarget).attr("data-id");
  let adminRoleRef = rtdb.ref(db, `/users/${currentID}/roles/admin`);
  rtdb.get(adminRoleRef).then(ss=>{
    if (ss.val() != false){
      rtdb.set(adminRoleRef, false);
      alert("You killed an admin");
    }
  });
};

rtdb.onValue(users, ss=>{
  $("#userLog").empty();
  let value = ss.val();
  if (value != null){
    let id = Object.keys(value);
    id.map((anId)=>{
      let user = JSON.stringify(value[anId].username);
      let adminValue = value[anId].roles.admin;
      let input = user.replace(/"/g, '');
      if(adminValue == true){
        $("#userLog").append(
          `<div class="Users" data-id=${anId}>${input + " (admin)"}</div> <button type="button" class="makeAdmin" data-id=${anId}>Make Admin</button> <button type="button" class="killAdmin" data-id=${anId}>Kill Admin</button>`
        );        
      }else{
        $("#userLog").append(
        `<div class="Users" data-id=${anId}>${input}</div> <button type="button" class="makeAdmin" data-id=${anId}>Make Admin</button> <button type="button" class="killAdmin" data-id=${anId}>Kill Admin</button>`
        );
      };
    });
  $(".makeAdmin").click(makeAdmin);
  $(".killAdmin").click(killAdmin);   
  $("#userLog").show();
  }
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
        `<div class="Messages" data-id=${anId}> <span class="usernm">${input + ":"} <\span>  <span class="msg">${msg} <\span> </div>`
      );
    });
    $(".Messages").click(clickHandlerEdit);
  };
});

let clickHandlerClr = function(target){
  let message = $("#message").val();
  rtdb.set(chats, []);
  $("#chatsLog").html("No Messages Here");
}
                 
let clickHandlerLoginPage = function(){
  $("#Registering").hide();
  $("#RegisterEmail").hide();
  $("#UserName").hide();
  $("#Password").hide();
  $("#ReenterPassword").hide();
  $("#Register").hide();
  $("#Loginpg").hide();
  $("#Loging").show();
  $("#LoginEmail").show();
  $("#LoginPassword").show();
  $("#Login").show();
  $("#Reg").show();
}

let clickHandlerRegisterPage = function(){
  $("#Loginpg").show();
  $("#LoginEmail").hide();
  $("#LoginPassword").hide();
  $("#Login").hide();
  $("#Reg").hide();
  $("#Loging").hide();
  $("#Registering").show();
  $("#RegisterEmail").show();
  $("#UserName").show();
  $("#Password").show();
  $("#ReenterPassword").show();
  $("#Register").show();
}

$("#SendMessage").click(clickHandlerMsg);
$("#Clear").click(clickHandlerClr);
$("#Loginpg").click(clickHandlerLoginPage);
$("#Reg").click(clickHandlerRegisterPage);