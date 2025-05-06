const Affiliate = require("../models/Affiliate");
const MongooseCheckValidity = require("../utils/mongooseUtils/MongooseCheckValidity")
// const BuildMethodResponse = require("../utils/reponses/BuildMethodResponse") // Removed local require
const mongoose = require("mongoose");
// Assuming Attendance model might be needed if registerAttendance is kept/modified
// const Attendance = require("../models/Attendance"); 

class AffiliateService {
    // Create a new affiliate or update if existing and update=true
    static async createAffiliate(affiliateData, update = false, session = null) {
        const ownSession = !session;
        const currentSession = session ?? await mongoose.startSession();
        if (ownSession) currentSession.startTransaction();

        try {
            // Check if affiliate with the same externalId exists
            const existing = await Affiliate
                .findOne({ externalId: affiliateData.externalId })
                .session(currentSession);

            // If creating (update=false) and externalId already exists → error
            if (!update && existing) {
                if (ownSession) await currentSession.abortTransaction();
                return global.BuildMethodResponse({ // Use global
                    success: false,
                    status: "CONFLICT", // Use a specific status
                    message: `affiliate.create_conflict`, // Translation key
                    messageData: { externalId: affiliateData.externalId } // Data for translation
                });
            }

            let affiliateDoc;
            let responseStatus = ""; // To store "Creado" or "Actualizado"

            if (existing && update) {
                // Update flow
                affiliateDoc = existing;
                affiliateDoc.set(affiliateData);
                responseStatus = "affiliate.updated"; // Translation key
            } else if (!existing) {
                // Create flow
                affiliateDoc = new Affiliate(affiliateData);
                responseStatus = "affiliate.created"; // Translation key
            } else {
                // This case shouldn't be reached due to the initial check, but handles update=true with non-existing doc conceptually
                 if (ownSession) await currentSession.abortTransaction();
                 // This path means update=true but no existing doc, which might be an error depending on intent
                 // Or perhaps it should create? For now, let's treat as not found if update was intended
                 return global.BuildMethodResponse({ // Use global
                     success: false,
                     status: "NOT_FOUND",
                     message: `affiliate.update_not_found`, 
                     messageData: { externalId: affiliateData.externalId }
                 });
            }

            // Validate the document before saving
            const { valid, invalidFields, doc } = await MongooseCheckValidity(Affiliate, affiliateDoc);
            if (!valid) {
                if (ownSession) await currentSession.abortTransaction();
                const fieldsList = invalidFields.join(", ");
                return global.BuildMethodResponse({ // Use global
                    success: false,
                    status: "INVALID_DATA",
                    message: `mongoose.invalid_fields`, // Generic translation key
                    messageData: { fields: fieldsList }
                });
            }
            affiliateDoc = doc; // Use validated doc

            // Save with session
            await affiliateDoc.save({ session: currentSession });

            if (ownSession) await currentSession.commitTransaction();
            
            // Return consistent success response
            return global.BuildMethodResponse({ // Use global
                success: true,
                status: responseStatus, // Use the translation key determined earlier
                message: responseStatus, // Use the key itself for translation in controller
                messageData: { // Data needed for the specific message
                   externalId: affiliateDoc.externalId,
                   fullName: affiliateDoc.fullName 
                }, 
                data: affiliateDoc // Return the created/updated doc
            });

        } catch (error) {
            console.error("Error in createAffiliate:", error); // Log the specific error
            if (ownSession) await currentSession.abortTransaction();
            // Generic error for unexpected issues
            return global.BuildMethodResponse({ // Use global
                success: false,
                status: "ERROR", // Generic error status
                message: "responses.general_error" // Generic translation key
            });
        } finally {
            if (ownSession) currentSession.endSession();
        }
    }

    /**
     * Update affiliate by ID.
     */
    static async updateAffiliate(affiliateId, updateData, session = null) {
        const ownSession = !session;
        const currentSession = session ?? await mongoose.startSession();
        if (ownSession) currentSession.startTransaction();

        try {
            // If changing externalId, ensure it's unique among others
            if (updateData.externalId) {
                const conflict = await Affiliate
                    .findOne({
                        externalId: updateData.externalId,
                        _id: { $ne: affiliateId } // Exclude the current document
                    })
                    .session(currentSession)
                    .lean(); // Use lean for faster check

                if (conflict) {
                    if (ownSession) await currentSession.abortTransaction();
                    return global.BuildMethodResponse({ // Use global
                        success: false,
                        status: "CONFLICT",
                        message: `affiliate.update_conflict`, // Translation key
                        messageData: { externalId: updateData.externalId }
                    });
                }
            }

            // Perform update
            const affiliate = await Affiliate.findByIdAndUpdate(
                affiliateId,
                updateData,
                {
                    new: true, // Return the modified document
                    runValidators: true, // Ensure validators run on update
                    session: currentSession
                }
            );

            // Check if affiliate was found and updated
            if (!affiliate) {
                if (ownSession) await currentSession.abortTransaction();
                return global.BuildMethodResponse({ // Use global
                    success: false,
                    status: "NOT_FOUND",
                    message: "affiliate.not_found" // Translation key
                });
            }

            if (ownSession) await currentSession.commitTransaction();

            // Consistent success response
            return global.BuildMethodResponse({ // Use global
                success: true,
                status: "UPDATED", // Specific status
                message: "affiliate.updated", // Translation key
                messageData: { 
                    externalId: affiliate.externalId, 
                    fullName: affiliate.fullName 
                },
                data: affiliate // Return updated doc
            });
        } catch (error) {
             // Handle validation errors specifically
             if (error.name === 'ValidationError') {
                 if (ownSession) await currentSession.abortTransaction();
                 // Extract invalid fields (simplified example)
                 const invalidFields = Object.keys(error.errors).join(', ');
                 return global.BuildMethodResponse({ // Use global
                     success: false,
                     status: "INVALID_DATA",
                     message: `mongoose.invalid_fields`, // Generic translation key
                     messageData: { fields: invalidFields }
                 });
            }
            console.error("Error in updateAffiliate:", error);
            if (ownSession) await currentSession.abortTransaction();
            return global.BuildMethodResponse({ // Use global
                success: false,
                status: "ERROR",
                message: "responses.general_error"
            });
        } finally {
            if (ownSession) currentSession.endSession();
        }
    }

    // Search affiliates based on query object
    static async searchAffiliates(query, session = null) {
        const ownSession = !session;
        const currentSession = session ?? await mongoose.startSession();
        // No transaction needed for read operation unless specified by caller

        try {
            // Execute find query - Removed .lean() to include virtuals
            const affiliates = await Affiliate.find(query)
                .session(currentSession); // Use session if provided
                // .lean(); // Removed lean() so virtuals (like fullName) are included

            // Commit transaction if we started it (though likely not needed for read)
            // if (ownSession) await currentSession.commitTransaction(); 
            
            return global.BuildMethodResponse({ // Use global
                success: true,
                status: "SUCCESS",
                message: "affiliate.search_success", // Translation key
                messageData: { count: affiliates.length },
                data: affiliates
            });
        } catch (error) {
            console.error("Error in searchAffiliates:", error);
            // if (ownSession) await currentSession.abortTransaction(); // Rollback if transaction started
            return global.BuildMethodResponse({ // Use global
                success: false,
                status: "ERROR",
                message: "responses.general_error"
            });
        } finally {
            // End session only if we created it
            if (ownSession) currentSession.endSession();
        }
    }

    // Deactivate (set active=false) an affiliate
    static async deactivateAffiliate(affiliateId, session = null) {
        const ownSession = !session;
        const currentSession = session ?? await mongoose.startSession();
        if (ownSession) currentSession.startTransaction();

        try {
            const affiliate = await Affiliate.findByIdAndUpdate(
                affiliateId,
                { active: false },
                { new: true, session: currentSession } // Return updated doc
            );

            if (!affiliate) {
                if (ownSession) await currentSession.abortTransaction();
                return global.BuildMethodResponse({ // Use global
                    success: false,
                    status: "NOT_FOUND",
                    message: "affiliate.not_found"
                });
            }
            
            if (ownSession) await currentSession.commitTransaction();
            
            return global.BuildMethodResponse({ // Use global
                success: true,
                status: "DEACTIVATED",
                message: "affiliate.deactivated",
                messageData: { fullName: affiliate.fullName },
                data: affiliate // Return deactivated affiliate
            });
        } catch (error) {
            console.error("Error in deactivateAffiliate:", error);
            if (ownSession) await currentSession.abortTransaction();
            return global.BuildMethodResponse({ // Use global
                success: false,
                status: "ERROR",
                message: "responses.general_error"
            });
        } finally {
            if (ownSession) currentSession.endSession();
        }
    }

    // Register a user's attendance to an affiliate (Model relationship unclear)
    // This method's purpose is ambiguous based on model structure.
    // Assuming it's meant to push a userId to an 'attendances' array *on the Affiliate model*
    static async registerAttendance(affiliateId, userId, session = null) {
        const ownSession = !session;
        const currentSession = session ?? await mongoose.startSession();
        if (ownSession) currentSession.startTransaction();

        try {
            // Find the affiliate first
            const affiliate = await Affiliate.findById(affiliateId).session(currentSession);

            if (!affiliate) {
                 if (ownSession) await currentSession.abortTransaction();
                 return global.BuildMethodResponse({ // Use global
                    success: false,
                    status: "NOT_FOUND",
                    message: "affiliate.not_found"
                 });
            }
            
            // Check if the Affiliate model actually has an 'attendances' array
            // This depends on the Affiliate schema definition. Assuming it does for now.
            if (!Array.isArray(affiliate.attendances)) {
                 // Handle case where schema doesn't support this
                 console.error(`Affiliate model (ID: ${affiliateId}) does not have an 'attendances' array.`);
                 if (ownSession) await currentSession.abortTransaction();
                 return global.BuildMethodResponse({ // Use global
                    success: false,
                    status: "SCHEMA_MISMATCH", // Custom status
                    message: "affiliate.attendance_not_supported" // Translation key
                 });
            }

            // Avoid duplicate attendance (if applicable)
            if (!affiliate.attendances.includes(userId)) {
                affiliate.attendances.push(userId);
                await affiliate.save({ session: currentSession });
            } else {
                // Optionally return a specific response if already registered
                // For now, treat as success even if already present
            }

            if (ownSession) await currentSession.commitTransaction();

            return global.BuildMethodResponse({ // Use global
                 success: true,
                 status: "REGISTERED", // Custom status
                 message: "affiliate.attendance_registered", // Translation key
                 messageData: { userId: userId, affiliateName: affiliate.fullName },
                 data: affiliate // Return updated affiliate
            });

        } catch (error) {
            console.error("Error in registerAttendance:", error);
            if (ownSession) await currentSession.abortTransaction();
            return global.BuildMethodResponse({ // Use global
                success: false,
                status: "ERROR",
                message: "responses.general_error"
            });
        } finally {
            if (ownSession) currentSession.endSession();
        }
    }

    // NOTE: getEventReport method removed as it belongs in EventService
}

module.exports = AffiliateService;
