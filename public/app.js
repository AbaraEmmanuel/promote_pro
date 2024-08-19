// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-analytics.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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
const db = getDatabase(app);

window.onload = async function () {
    // Debug: Log if Telegram WebApp is initialized
    if (window.Telegram && window.Telegram.WebApp) {
        console.log("Telegram WebApp initialized");
        
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        console.log("User data from Telegram:", user);  // Debug: Log user data

        const userId = user?.id;
        const firstName = user?.first_name || "";
        const lastName = user?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();

        // Ensure the element exists
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = fullName;
        } else {
            console.error('User name element not found');
        }

        if (userId) {
            try {
                // Fetch user data from Firebase Realtime Database using Telegram user ID
                const userRef = ref(db, `users/${userId}`);
                const snapshot = await get(userRef);
                const data = snapshot.val();

                console.log("Firebase user data:", data);  // Debug: Log Firebase data

                if (data) {
                    document.getElementById('points').textContent = data.points || 0;
                    document.getElementById('tasksDone').textContent = data.tasksDone || 0;

                    // Mark completed tasks based on data from Firebase
                    const completedTasks = data.completedTasks || [];
                    document.querySelectorAll('.task').forEach(task => {
                        if (completedTasks.includes(task.id)) {
                            task.classList.add('completed');
                            task.querySelector('.complete-btn').textContent = 'Completed';
                        }
                    });
                } else {
                    // If no user data exists in Firebase, initialize it
                    await set(userRef, {
                        points: 0,
                        tasksDone: 0,
                        completedTasks: []
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }

            // Handle task completion
            document.querySelectorAll('.complete-btn').forEach(button => {
                button.addEventListener('click', async function () {
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

                        // Update data in Firebase Realtime Database
                        try {
                            const completedTasks = Array.from(document.querySelectorAll('.task.completed')).map(task => task.id);

                            await set(ref(db, `users/${userId}`), {
                                points,
                                tasksDone,
                                completedTasks
                            });
                        } catch (error) {
                            console.error('Error updating user data:', error);
                        }
                    }
                });
            });
        }
    } else {
        console.error('Telegram WebApp is not available');
    }
};
