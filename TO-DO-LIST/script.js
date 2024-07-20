let tasks = [];
let completedTasks = [];

function renderTaskList(taskList, listElement) {
  listElement.innerHTML = "";
  taskList.forEach(function(task) {
    const taskElement = document.createElement("LI");
    taskElement.textContent = `${task.text}\n${task.date}`;
    const editBtn = document.createElement("BUTTON");
    editBtn.textContent = "Edit";
    editBtn.className = "edit";
    taskElement.appendChild(editBtn);
    const deleteBtn = document.createElement("BUTTON");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    taskElement.appendChild(deleteBtn);
    const completeBtn = document.createElement("BUTTON");
    completeBtn.textContent = "Complete";
    completeBtn.className = "complete";
    taskElement.appendChild(completeBtn);
    listElement.appendChild(taskElement);

    editBtn.addEventListener("click", function() {
      handleEditTask(task, taskElement);
    });

    deleteBtn.addEventListener("click", function() {
      handleDeleteTask(task, taskList, listElement);
    });

    completeBtn.addEventListener("click", function() {
      handleCompleteTask(task, taskList, listElement);
    });
  });
}

function handleEditTask(task, taskElement) {
  const editInput = document.createElement("INPUT");
  editInput.type = "text";
  editInput.value = task.text;
  taskElement.textContent = "";
  taskElement.appendChild(editInput);
  const saveBtn = document.createElement("BUTTON");
  saveBtn.textContent = "Save";
  taskElement.appendChild(saveBtn);
  editInput.focus();
  saveBtn.addEventListener("click", function() {
    task.text = editInput.value;
    taskElement.textContent = `${task.text}\n${task.date}`;
    const editBtn = document.createElement("BUTTON");
    editBtn.textContent = "Edit";
    editBtn.className = "edit";
    taskElement.appendChild(editBtn);
    const deleteBtn = document.createElement("BUTTON");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    taskElement.appendChild(deleteBtn);
    const completeBtn = document.createElement("BUTTON");
    completeBtn.textContent = "Complete";
    completeBtn.className = "complete";
    taskElement.appendChild(completeBtn);
    editBtn.addEventListener("click", function() {
      handleEditTask(task, taskElement);
    });
    deleteBtn.addEventListener("click", function() {
      handleDeleteTask(task, tasks, taskElement.parentNode);
    });
    completeBtn.addEventListener("click", function() {
      handleCompleteTask(task, tasks, taskElement.parentNode);
    });
  });
}

function handleDeleteTask(task, taskList, listElement) {
  const index = taskList.indexOf(task);
  if (index !== -1) {
    taskList.splice(index, 1);
    renderTaskList(taskList, listElement);
  }
}

function handleCompleteTask(task, taskList, listElement) {
  const index = taskList.indexOf(task);
  if (index !== -1) {
    taskList.splice(index, 1);
    completedTasks.push(task);
    renderTaskList(taskList, listElement);
    renderTaskList(completedTasks, document.getElementById("completed-tasks"));
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskInput = document.getElementById("task-input");
  const tasksList = document.getElementById("tasks");
  const completedTasksList = document.getElementById("completed-tasks");

  addTaskBtn.addEventListener("click", function(event) {
    event.preventDefault();
    const task = taskInput.value.trim();
    if (task) {
      const currentDate = new Date();
      const taskWithDate = {
        text: task,
        date: currentDate.toLocaleDateString() + " " + currentDate.toLocaleTimeString(),
        completed: false
      };
      tasks.push(taskWithDate);
      taskInput.value = "";
      renderTaskList(tasks, tasksList);
    }
  });

  renderTaskList(tasks, tasksList);
  renderTaskList(completedTasks, completedTasksList);
});