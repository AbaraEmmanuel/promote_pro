window.onload = async function() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userId = user?.user?.id;
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        document.getElementById('userName').textContent = `${firstName} ${lastName}` || "Guest";

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
                        username: firstName,
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
