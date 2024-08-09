import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4DVbIQUzhNSczujsP27MwTE6NfifB8ew",
  authDomain: "promote-pro-8f9aa.firebaseapp.com",
  projectId: "promote-pro-8f9aa",
  storageBucket: "promote-pro-8f9aa.appspot.com",
  messagingSenderId: "553030063178",
  appId: "1:553030063178:web:13e2b89fd5c6c628ccc2b3",
  measurementId: "G-KZ89FN869W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.onload = function() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userId = user?.user?.id;
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        // Display the username
        document.getElementById('userName').textContent = `${firstName} ${lastName}`;

        if (userId) {
            // Fetch user data from Firestore
            const userDoc = doc(db, "users", userId.toString());
            getDoc(userDoc)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        document.getElementById('points').textContent = data.points || 0;
                        document.getElementById('tasksDone').textContent = data.tasksDone || 0;

                        // Mark completed tasks
                        const completedTasks = data.completedTasks || [];
                        document.querySelectorAll('.task').forEach(task => {
                            if (completedTasks.includes(task.id)) {
                                task.classList.add('completed');
                                task.querySelector('.complete-btn').textContent = 'Completed';
                            }
                        });
                    } else {
                        console.error('No such document!');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error);
                });

            // Handle task completion
            document.querySelectorAll('.complete-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const taskId = this.getAttribute('data-task');
                    const taskElement = document.getElementById(taskId);
                    let points = parseInt(document.getElementById('points').textContent);
                    let tasksDone = parseInt(document.getElementById('tasksDone').textContent);

                    if (!taskElement.classList.contains('completed')) {
                        taskElement.classList.add('completed');
                        this.textContent = 'Completed';

                        points += 10;
                        tasksDone += 1;

                        document.getElementById('points').textContent = points;
                        document.getElementById('tasksDone').textContent = tasksDone;

                        // Send updated data to Firestore
                        const updatedData = {
                            points,
                            tasksDone,
                            completedTasks: [...(document.querySelectorAll('.task.completed').map(task => task.id))]
                        };
                        
                        setDoc(userDoc, updatedData, { merge: true })
                            .then(() => {
                                console.log('Data successfully sent to Firestore');
                            })
                            .catch((error) => {
                                console.error('Error sending data to Firestore:', error);
                            });
                    }
                });
            });
        }
    } else {
        console.error('Telegram WebApp is not available');
    }
};
