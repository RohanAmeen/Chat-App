import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js"; 
import { getAuth, GoogleAuthProvider, signInWithPopup, updateProfile, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    setDoc,
    doc,
    getFirestore,
    collection,
    query,
    onSnapshot,
    orderBy,
    limit,
    addDoc, updateDoc, deleteDoc, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB4jcnjdDI5r492rKNCYiAWjgNHuupLUak",
    authDomain: "chat-app-by-rohan.firebaseapp.com",
    projectId: "chat-app-by-rohan",
    storageBucket: "chat-app-by-rohan.appspot.com",
    messagingSenderId: "719332895148",
    appId: "1:719332895148:web:263fa95d49325594173209",
    measurementId: "G-JVKQYXSN1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const loginWithGoogleBtn = document.getElementById("loginWithGoogleBtn")
const logoutBtn = document.getElementById("logoutBtn")
const currentPageName = window.location.pathname.split("/").pop();
const userImg = document.getElementById("uimage")
const signupBtn = document.getElementById("signupBtn")
const signinBtn = document.getElementById("signinBtn")
const lbl = document.getElementById("uemail")
const msgContainer = document.getElementById("msgContainer");
const sendMessageBtn = document.getElementById("sendMessageBtn")
const messageInput = document.getElementById("messageInput");

let email;
let password;
let udisplayName;

// console.log(currentPageName)

function scrollToBottom() {
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

const loadMessages = ({ uid }) => {
    const q = query(collection(db, "messages"), orderBy("createdAt"), limit(25));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesHTML = querySnapshot.docs
            .map((doc) => {
                const messages = doc.data();
                const timestamp = messages.createdAt;
                const date = new Date(timestamp);
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const formattedTime = `${hours}:${minutes}`;

                const isMyChat = messages.uid === uid ? "chat-end" : "chat-start";
                const chatType = messages.text;

                return `
            <div class="chat ${isMyChat}">
              <div class="chat-image avatar">
                <div class="w-10 rounded-full">
                  <img alt="Tailwind CSS chat bubble component" src="${messages.photoURL}" />
                </div>
              </div>
              <div class="chat-header">
                ${messages.displayName}
                <time class="text-xs opacity-50">${formattedTime}</time>
              </div>
              <div class='chat-bubble'>${chatType}</div>
              <div class="chat-footer opacity-50">Delivered</div>
            </div>
          `;
            })
            .join("");

        // console.log(messagesHTML)
        // console.log(msgContainer)
        msgContainer.innerHTML = messagesHTML;
        scrollToBottom();
    });
};

const onLoad = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadMessages(user);
            if (currentPageName !== "chatapp.html") {
                window.location.href = "chatapp.html"
            }
            // console.log(typeof(user))
            console.log(user)
            lbl.innerText = user.displayName;
            if (user.photoURL) {
                userImg.src = user.photoURL;
            }
        } else {

            if (currentPageName !== "index.html" && currentPageName !== "" && currentPageName !== "signup.html" && currentPageName !== "") {
                window.location.href = "index.html"
            }

            // console.log("User Is not Logged In!")
        }
    });
}

onLoad()


const sendMessage = async ({ type = "text" }) => {
    const user = auth.currentUser;
    const text = messageInput.value;
    const id = Date.now();
    try {
        if (user) {
            if (text.trim()) {
                const { email, displayName, photoURL, uid } = user;
                const payload = {
                    createdAt: id,
                    dicId: id,
                    text,
                    uid,
                    email,
                    displayName,
                    photoURL
                    //   type,
                    //   ...(type === uploadTypes.image && { imageURL }),
                };

                await setDoc(doc(db, "messages", `${id}`), payload);
                messageInput.value = "";
                scrollToBottom();
            } else {
                alert("Please Input Text");
            }
        }
    } catch (err) {
        // console.log(err);
    }
};

const addDataInFirestore = async () => {
    const fName = document.getElementById("fname").value;
    const lName = document.getElementById("lname").value;
    email = document.getElementById("emailid").value;  // Declare at a higher scope
    password = document.getElementById("pass").value;  // Declare at a higher scope
    const cpass = document.getElementById("cpass").value;

    udisplayName = `${fName} ${lName}`;

    console.log(udisplayName);
    if (password === cpass && cpass !== "" && fName !== "" && lName !== "" && email !== "") {
        console.log(fName + lName + email + password + cpass);
        if (cpass.length < 6 && password.length < 6) {
            alert("Please enter a password atleast 6 characters long!")
        }
        else {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("User signed up:", user);
                    // You can redirect the user or perform other actions here
                    updateProfile(auth.currentUser, {
                        displayName: udisplayName, photoURL: "https://api-private.atlassian.com/users/4f5f736dffd9036ec97f3e366931bc7c/avatar"
                    }).then(() => {
                        // Profile updated!
                        // ...
                    }).catch((error) => {
                        // An error occurred
                        // ...
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Error during sign up:", errorCode, errorMessage);
                });
        }
    }
    else {
        alert("Please fill all the fields!")
    }
};

sendMessageBtn && sendMessageBtn.addEventListener("click", sendMessage);

signupBtn && signupBtn.addEventListener("click", addDataInFirestore)

const signIn = () => {
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    console.log(email + password);
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log(user);
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode + errorMessage);
            alert("Invalid credentials!")
        });
}

signinBtn && signinBtn.addEventListener("click", signIn)

const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        });
}

const logOut = () => {
    signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });
}


loginWithGoogleBtn && loginWithGoogleBtn.addEventListener("click", signInWithGoogle)

logoutBtn && logoutBtn.addEventListener("click", logOut)