const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const prisma = new PrismaClient();

// CREATE TASK
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        status: status === "completed" ? "completed" : "pending",
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
});

// GET TASKS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks =
      req.user.role === "admin"
        ? await prisma.task.findMany({
            orderBy: { createdAt: "desc" },
          })
        : await prisma.task.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
          });

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    });
  }
});

// UPDATE TASK
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { title, description, status } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      existingTask.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own tasks",
      });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title ? title.trim() : existingTask.title,
        description:
          description !== undefined
            ? description
            : existingTask.description,
        status:
          status === "completed" || status === "pending"
            ? status
            : existingTask.status,
      },
    });

    res.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error while updating task",
    });
  }
});

// DELETE TASK
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      existingTask.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own tasks",
      });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
    });
  }
});

module.exports = router;