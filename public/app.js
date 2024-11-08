// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.x/firebase-firestore.js";

// Firebase configuration (replace with your actual config from Firebase Console)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.onload = async function() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userId = user?.user?.id;
        const username = user?.user?.username;

        document.getElementById('userName').textContent = username || "Guest";

        if (userId) {
            try {
                // Check if user exists in Firestore
                const userRef = doc(db, "users", userId);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    document.getElementById('points').textContent = data.points || 0;
                    document.getElementById('tasksDone').textContent = data.tasks_done || 0;

                    // Mark completed tasks
                    const completedTasks = data.completed_tasks || [];
                    document.querySelectorAll('.task').forEach(task => {
                        if (completedTasks.includes(task.id)) {
                            task.classList.add('completed');
                            task.querySelector('.complete-btn').textContent = 'Completed';
                        }
                    });
                } else {
                    // Initialize new user data
                    await setDoc(userRef, {
                        username: username,
                        points: 0,
                        tasks_done: 0,
                        completed_tasks: []
                    });
                }

                // Handle task submission button
                document.getElementById('submitTask').addEventListener('click', async function() {
                    // Submit link to Firestore
                    const link = document.getElementById('taskLink').value;
                    await updateDoc(userRef, { link: link, status: "On review" });
                    this.textContent = "On review";
                });
            } catch (error) {
                console.error('Error initializing Firestore user data:', error);
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

                        // Update Firestore with new points and task status
                        await updateDoc(userRef, {
                            points: points,
                            tasks_done: tasksDone,
                            completed_tasks: [...(data.completed_tasks || []), taskId]
                        });
                    }
                });
            });
        }
    } else {
        console.error('Telegram WebApp is not available');
    }
};
