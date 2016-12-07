$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCncoJYfiKxykmofW6lGf3W0C8lZwdLDa0",
    authDomain: "kev0213-12e61.firebaseapp.com",
    databaseURL: "https://kev0213-12e61.firebaseio.com",
    storageBucket: "kev0213-12e61.appspot.com",
    messagingSenderId: "607450137632"
  };
  firebase.initializeApp(config);
  // Firebase database reference
 var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');

  var photoURL;
  var $img = $('img');

  // REGISTER DOM ELEMENTS
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $hovershadow = $('.hover-shadow');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');
  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $messageField = $('#messageInput');
  const $nameField = $('#nameInput');
  const $messageList = $('#example-messages');
  const $message = $('#example-messages');
  const $profileAge = $('#profile-age');
    const $profileWork = $('#profile-work');
    const $profileInfo = $('#profile-description');

  // Hovershadow
  $hovershadow.hover(
    function(){
      $(this).addClass("mdl-shadow--4dp");
    },
    function(){
      $(this).removeClass("mdl-shadow--4dp");
    }
  );


  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function() {
    $file.change(handleFileSelect);
    // $file.disabled = false;
  }

  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignUp.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled')
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
  }

  // Sign In
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log('SignIn User');
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user is "+user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.child("data").push({email:user.email});
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    if(user) {
      const dbUserid = dbUser.child(user.uid);
      console.log(user);
      const loginName = user.displayName || user.email;
      $signInfo.html(loginName+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      $img.attr("src",user.photoURL);
      $profileAge.html(user.displayage);
      $profileWork.html(user.work);
      $profileInfo.html(user.uid.info);
      dbUserid.once('child_added',function(snapshot){
          var data = snapshot.val();
          $profileAge.html(data.age);
          $profileWork.html(data.work);
          $profileInfo.html(data.info);
        });


      console.log(user);
      $signInfo.html(user.email+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      // Add a callback that is triggered for each chat message.
      dbChatRoom.limitToLast(50).on('child_added', function (snapshot) {
        //GET DATA
        var data = snapshot.val();
        var username = data.name || "nonameXD";
        var message = data.text;

        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        var $messageElement = $("<li>");
        var $nameElement = $("<strong class='example-chat-username'></strong>");
        $nameElement.text(username);
        $messageElement.text(message).prepend($nameElement);

        //ADD MESSAGE
        $messageList.append($messageElement)


        //SCROLL TO BOTTOM OF MESSAGE LIST
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });//child_added callback

      user.providerData.forEach(function (profile) {
        console.log("Sign-in provider: "+profile.providerId);
        console.log("  Provider-specific UID: "+profile.uid);
        console.log("  Name: "+profile.displayName);
        console.log("  Email: "+profile.email);
        console.log("  Photo URL: "+profile.photoURL);
      });

    } else {
      console.log("not logged in");
      $profileName.html("N/A");
      $profileEmail.html('N/A');
      $profileWork.html('N/A');
      $profileAge.html('N/A');
      $profileInfo.html('N/A');
      $img.attr("src","");
    }
  });

  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')

  });

  // Submit
  $btnSubmit.click(function(){
    var user = firebase.auth().currentUser;
    const $userName = $('#userName').val();
    const userName = $('#userName').val();
    const userAge = $('#userAge').val();
    const userWork = $('#userWork').val();
    const userDescription = $('#userDescription').val();
    const promise = user.updateProfile({
      displayName: $userName,
      photoURL: photoURL
    });
    promise.then(function() {
      const dbUserid = dbUser.child(user.uid);
      if(userAge != "")dbUserid.child("data").update({age:userAge});
      if(userWork != "")dbUserid.child("data").update({work:userWork});
      if(userDescription != "")dbUserid.child("data").update({info:userDescription});

      console.log("Update successful.");
      user = firebase.auth().currentUser;
      if (user) {
        $profileName.html(user.displayName);
        $profileEmail.html(user.email);
        $img.attr("src",user.photoURL);
        dbUserid.once('child_added',function(snapshot){
            var data = snapshot.val();
            console.log(data.age);
            $profileAge.html(data.age);
            $profileWork.html(data.work);
            $profileInfo.html(data.info);
          });

        const loginName = user.displayName || user.email;
        $signInfo.html(loginName+" is login...");

      }
    });
  });

  $messageField.keypress(function (e) {
    if (e.keyCode == 13) {
      //FIELD VALUES
	   var user = firebase.auth().currentUser;
	   var username = user.displayName;
      var message = $messageField.val();
      console.log(username);
      console.log(message);

      //SAVE DATA TO FIREBASE AND EMPTY FIELD
      dbChatRoom.push({name:username, text:message});
      $messageField.val('');
    }
  });

});