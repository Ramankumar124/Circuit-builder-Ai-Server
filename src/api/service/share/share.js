import Share from "../../model/share.js";
import Circuit from "../../model/circuit.js";
import { properties } from "../../../config/properties.js";
import {handleError} from "../../../util/handleError.js"

export const createShareLink = async (req, res) => {
  try {
    const { circuitId } = req.body;
    const circuit = await Circuit.findById(circuitId);
    if (!circuit) {
      return res.status(404).send({ message: "Circuit not found" });
    }

    const existingShare = await Share.findOne({ circuitId });
    if (existingShare) {
      return res.send({ shareableLink: `https://${properties?.FRONTEND_URL}/shared/${existingShare._id}` });
    }

    const newShare = new Share({
      isShare: true,
      circuitId,
    });
    await newShare.save();

    return res.send({ shareableLink: `https://${properties?.FRONTEND_URL}/shared/${newShare._id}` });
    
  } catch (error) {
    handleError(error, res);
  }
};

export const getLink = async (req, res) => {
    try {
      const { shareId } = req.params;
      
      const share = await Share.findById(shareId).populate("circuitId");
  
      if (!share) {
        return res.status(400).send({ message: "Invalid link" });
      }
  
      if (!share.circuitId) {
        return res.status(400).send({ message: "Circuit not found" });
      }
  
      return res.status(200).send({ data: share.circuitId });
      
    } catch (error) {
      handleError(error, res);
    }
  };
  