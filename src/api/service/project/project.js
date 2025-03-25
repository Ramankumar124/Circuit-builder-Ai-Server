import Project from "../../model/project.js";
import {handleError} from "../../../util/handleError.js"

// ✅ Create a new project
export const createProject = async (req, res) => {
  try {
    const { projectName } = req.body;
    const { id } = req.user;

    const newProject = new Project({ projectName, userId: id });
    await newProject.save();

    res
      .status(200)
      .send({
        message: "Project created successfully",
        data: newProject,
      });
  } catch (error) {
    handleError(error, res);
  }
};

// ✅ Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const page = Number(req.query?.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const userId = req.params?.id;

    console.log("userId", userId);

    const projects = await Project.find({ userId })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "circuits",
        model: "Circuit",
      });

    const totalProjects = await Project.countDocuments({ userId });

    // Pagination meta data
    const totalPages = Math.ceil(totalProjects / limit);
    const previousPage = page - 1 === 0 ? null : page - 1;
    const nextPage = page >= totalPages ? null : page + 1;

    res.status(200).send({
      data: projects,
      meta: {
        totalProjects,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        previousPage,
        nextPage,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

// ✅ Update project name
export const updateProject = async (req, res) => {
  try {
    const { projectName } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { projectName },
      { new: true }
    );

    if (!updatedProject)
      return res
        .status(404)
        .send({ message: "Project not found" });

    res
      .status(200)
      .send({
        message: "Project updated",
        data: updatedProject,
      });
  } catch (error) {
    handleError(error, res)
  }
};

// ✅ Delete a project and its associated circuits
export const deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    res
      .status(200)
      .send({ message: "Project deleted successfully" });
  } catch (error) {
    handleError(error, res);
  }
};
