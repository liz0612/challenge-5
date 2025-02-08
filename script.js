// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task ID
function generateTaskId() {
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return nextId;
}

// Function to create a task card
function createTaskCard(task) {
    let color = "";
    let today = dayjs().format("YYYY-MM-DD");

    if (dayjs(task.deadline).isBefore(today)) {
        color = "red";
    } else if (dayjs(task.deadline).isBefore(dayjs().add(3, "day"))) {
        color = "yellow";
    }

    return `
        <div class="task-card" draggable="true" data-id="${task.id}" style="background:${color}">
            <h5>${task.title}</h5>
            <p>${task.description}</p>
            <p>Due: ${dayjs(task.deadline).format("MMM DD, YYYY")}</p>
            <button class="delete-task btn btn-danger" data-id="${task.id}">Delete</button>
        </div>`;
}

// Function to render tasks
function renderTaskList() {
    console.log("Rendering Task List...");

    // Ensure task containers are emptied before rendering
    $("#todo-cards, #in-progress-cards, #done-cards").empty();

    // Load and place tasks in their respective columns
    taskList.forEach((task) => {
        let targetColumn = "";
        if (task.status === "to-do") {
            targetColumn = "#todo-cards";
        } else if (task.status === "in-progress") {
            targetColumn = "#in-progress-cards";
        } else if (task.status === "done") {
            targetColumn = "#done-cards";
        }

        if (targetColumn) {
            $(targetColumn).append(createTaskCard(task));
        } else {
            console.error("Invalid task status:", task);
        }
    });

    // Enable Drag Events
    $(".task-card").on("dragstart", function (event) {
        event.originalEvent.dataTransfer.setData("text/plain", $(this).attr("data-id"));
    });

    console.log("Task List Successfully Rendered!");
}

// Function to add a new task
function handleAddTask() {
    console.log("Adding New Task...");

    let title = $("#taskTitle").val().trim();
    let description = $("#taskDescription").val().trim();
    let deadline = $("#taskDeadline").val().trim();

    if (!title || !deadline) {
        alert("Please enter a title and deadline.");
        return;
    }

    let id = generateTaskId();
    let newTask = { id, title, description, deadline, status: "to-do" };

    // Add the new task and save it
    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Render the updated task list
    renderTaskList();
    $("#formModal").modal("hide");
    $("#taskForm")[0].reset();
}

// Function to delete a task
function handleDeleteTask(event) {
    let id = parseInt($(event.target).data("id"));
    taskList = taskList.filter((task) => task.id !== id);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Drag & Drop Event Handlers
$(".task-container").on("dragover", function (event) {
    event.preventDefault();
});

$(".task-container").on("drop", function (event) {
    event.preventDefault();
    let taskId = event.originalEvent.dataTransfer.getData("text/plain");
    let newStatus = $(this).attr("id").replace("-cards", ""); // Convert "todo-cards" to "to-do"

    let taskIndex = taskList.findIndex((task) => task.id == taskId);
    if (taskIndex !== -1) {
        taskList[taskIndex].status = newStatus;
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }
});

// Initialize App
$(document).ready(function () {
    console.log("Initializing Task Board...");

    $("#addTaskBtn").on("click", function () {
        $("#formModal").modal("show");
    });

    $(document).on("click", "#saveTaskBtn", handleAddTask);
    $(document).on("click", ".delete-task", handleDeleteTask);

    $("#taskDeadline").datepicker({ dateFormat: "yy-mm-dd" });

    renderTaskList();
});
