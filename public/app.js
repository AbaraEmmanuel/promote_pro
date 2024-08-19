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
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userId = user?.user?.id;
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        // Display the username
        document.getElementById('userName').textContent = `${firstName} ${lastName}`;

        if (userId) {
            try {
                // Fetch user data from Firebase Realtime Database
                const userRef = ref(db, `users/${userId}`);
                const snapshot = await get(userRef);
                const data = snapshot.val();

                if (data) {
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
                    // If user data doesn't exist, initialize it in Firebase
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
