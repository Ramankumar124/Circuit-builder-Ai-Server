import Circuit from "../../model/circuit.js"
import Project from "../../model/project.js"
import {handleError,handleGeminiError} from "../../../util/handleError.js"
import generateCircuit from "../../../util/ai-agent.js"
import { systemPrompt,enhanceSystemPrompt } from "../../../prompt/systemPrompt.js"

//  Create a new circuit
export const createCircuit = async (req, res) => {
    try {
        const { prompt } = req.body;

        if(!prompt) return res.status(400).send({message: "Enter prompt"})

        const circuit = await generateCircuit(prompt, systemPrompt)

        res.status(201).send({ message: "Circuit created", data: circuit });
        console.log(circuit);
        
    } catch (error) {
        handleGeminiError(error, res);
    }
};

//  Get all circuits
export const getAllCircuits = async (req, res) => {
    try {
        const {projectId} = req.params
        const circuits = await Circuit.find({projectId}).populate("projectId", "projectName");
        res.status(200).send({ data: circuits });
    } catch (error) {
        handleError(error, res)
    }
};

// Update a circuit
export const updateCircuit = async (req, res) => {
    try {
        const { prompt } = req.body;
        const {id} = req.params

        const circuit = await generateCircuit(prompt)
        const updatedCircuit = await Circuit.findByIdAndUpdate(
            {id},
            { prompt, circuit },
            { new: true }
        );

        if (!updatedCircuit) return res.status(404).json({ success: false, message: "Circuit not found" });

        res.status(200).send({ message: "Circuit updated", circuit: updatedCircuit });
    } catch (error) {
        handleError(error, res);
    }
};

export const saveProjectCircuit = async(req, res) => {
    try {
        const {projectName, prompt, circuit, userId} = req.body

       const project = new Project({projectName, userId});
        await project.save()

        const newCircuit = new Circuit({prompt, circuit, projectId: project?._id});
        await newCircuit.save()
        const payload = {...project, ...newCircuit, circuitId: newCircuit?._id, projectId: project?._id};
        return res.status(200).send({message: "Project created successfully", data: payload});
    } catch (error) {
        handleError(error, res);
    }
}

export const enhancePrompt = async(req, res) => {
    try {
        const { prompt } = req.body;

        if(!prompt) return res.status(400).send({message: "Enter prompt"})

        const enhacedPrompt = await generateCircuit(prompt,enhanceSystemPrompt)

        res.status(201).send({ message: "Enhanced prompt generated successfully.", data: enhacedPrompt });
        console.log(enhacedPrompt);
        
    } catch (error) {
        handleGeminiError(error, res);
    }
}