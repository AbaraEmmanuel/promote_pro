// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Your Firebase configuration
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

window.onload = async function() {
    console.log('Page loaded');
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userId = user?.user?.id;
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        console.log('User Data:', user);
        console.log('User ID:', userId);

        document.getElementById('userName').textContent = `${firstName} ${lastName}`;

        if (userId) {
            try {
                // Fetch user data from Firestore
                console.log('Fetching user data...');
                const userDoc = doc(db, "users", userId.toString());
                const docSnap = await getDoc(userDoc);

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
                    console.log("No such document!");
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

                        // Update Firestore with the new data
                        try {
                            await setDoc(doc(db, "users", userId.toString()), {
                                points,
                                tasksDone,
                                completedTasks: [...(document.querySelectorAll('.task.completed').map(task => task.id))]
                            }, { merge: true });

                            console.log('Data successfully sent to Firestore');
                        } catch (error) {
                            console.error('Error updating data in Firestore:', error);
                        }
                    }
                });
            });
        }
    } else {
        console.error('Telegram WebApp is not available');
    }
};

