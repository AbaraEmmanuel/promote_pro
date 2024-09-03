// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4DVbIQUzhNSczujsP27MwTE6NfifB8ew",
  authDomain: "promote-pro-8f9aa.firebaseapp.com",
  databaseURL: "https://promote-pro-8f9aa-default-rtdb.firebaseio.com",
  projectId: "promote-pro-8f9aa",
  storageBucket: "promote-pro-8f9aa.appspot.com",
  messagingSenderId: "553030063178",
  appId: "1:553030063178:web:13e2b89fd5c6c628ccc2b3",
  measurementId: "G-KZ89FN869W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

window.onload = async function() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userId = user?.user?.id;
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        // Ensure the DOM is fully loaded
        document.addEventListener("DOMContentLoaded", async function() {
            // Display the username
            document.getElementById('userName').textContent = `${firstName} ${lastName}`;

            if (userId) {
                try {
                    // Fetch user data from Firestore
                    const docRef = doc(db, "userPoints", userId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        document.getElementById('points').textContent = data.points || 0;
                        document.getElementById('tasksDone').textContent = data.tasksDone || 0;

                        // Mark completed tasks
                        const completedTasks = data.completedTasks || [];
                        completedTasks.forEach(taskId => {
                            const taskElement = document.getElementById(taskId);
                            if (taskElement) {
                                taskElement.classList.add('completed');
                                taskElement.querySelector('.complete-btn').textContent = 'Completed';
                            }
                        });
                    } else {
                        // Initialize user data if not found in Firestore
                        await initializeUserData(userId);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }

                // Handle task completion
                document.querySelectorAll('.complete-btn').forEach(button => {
                    button.addEventListener('click', async function() {
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

                            // Update user data in Firestore
                            await updateUserData(userId, points, tasksDone);
                        }
                    });
                });
            }
        });
    } else {
        console.error('Telegram WebApp is not available');
    }
};

// Function to initialize user data
async function initializeUserData(userId) {
    try {
        const docRef = doc(db, "userPoints", userId);
        await setDoc(docRef, {
            points: 0,
            tasksDone: 0,
            completedTasks: []
        });
    } catch (error) {
        console.error('Error initializing user data:', error);
    }
}

// Function to update user data
async function updateUserData(userId, points, tasksDone) {
    try {
        const completedTasks = Array.from(document.querySelectorAll('.task.completed')).map(task => task.id);
        const docRef = doc(db, "userPoints", userId);

        await setDoc(docRef, {
            points: points,
            tasksDone: tasksDone,
            completedTasks: completedTasks
        });
    } catch (error) {
        console.error('Error updating user data:', error);
    }
}
