const Affiliate = require("../models/Affiliate");
const MongooseCheckValidity = require("../utils/mongooseUtils/MongooseCheckValidity")
const BuildMethodResponse = require("../utils/reponses/BuildMethodResponse")
const mongoose = require("mongoose");

class AffiliateService {
    // Create a new affiliate
    static async createAffiliate(affiliateData, update = false, session = null) {
        const ownSession = !session;
        const currentSession = session ?? await mongoose.startSession();
        if (ownSession) currentSession.startTransaction();
    
        let response = BuildMethodResponse({
          success: false,
          status: "Fallido",
          message:
            "El afiliado no ha sido creado, la causa es desconocida",
          externalId: "0",
          fullName: "N/A",
        });
    
        try {
          // Only check externalId uniqueness
          const existing = await Affiliate
            .findOne({ externalId: affiliateData.externalId })
            .session(currentSession);
    
          // If creating (update=false) and externalId already exists → error
          if (!update && existing) {
            if (ownSession) await currentSession.abortTransaction();
            return BuildMethodResponse({
              success: false,
              status: "Fallido",
              message: `Ya existe un afiliado con el Id externo ${affiliateData.externalId}`,
              externalId: affiliateData.externalId
            });
          }
    
          let affiliateDoc;
          if (existing) {
            // update flow
            affiliateDoc = existing;
            affiliateDoc.set(affiliateData);
            response = BuildMethodResponse({
              success: true,
              status: "Actualizado",
              message: "Se ha actualizado el afiliado",
              externalId: affiliateDoc.externalId
            });
          } else {
            // create flow
            affiliateDoc = new Affiliate(affiliateData);
            response = BuildMethodResponse({
              success: true,
              status: "Creado",
              message: "Se ha creado el afiliado",
              externalId: affiliateDoc.externalId
            });
          }
    
          // Validate
          const { valid, invalidFields, doc } = await MongooseCheckValidity(Affiliate, affiliateDoc);
          if (!valid) {
            if (ownSession) await currentSession.abortTransaction();
            const fieldsList = invalidFields.join(", ");
            return BuildMethodResponse({
              success: false,
              status: "Fallido",
              message: `Campos inválidos: ${fieldsList}`
            });
          }
          affiliateDoc = doc;
    
          // Save with session
          await affiliateDoc.save({ session: currentSession });
    
          if (ownSession) await currentSession.commitTransaction();
          return BuildMethodResponse({
            ...response,
            fullName: affiliateDoc.fullName,
            data: affiliateDoc
          });
        } catch (error) {
          console.error(error);
          if (ownSession) await currentSession.abortTransaction();
          return BuildMethodResponse({
            success: false,
            status: "Error Fatal",
            message: "Error al crear/actualizar el afiliado"
          });
        } finally {
          if (ownSession) currentSession.endSession();
        }
      }
    
      /**
       * Update affiliate by ID, only externalId uniqueness is enforced.
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
                _id: { $ne: affiliateId }
              })
              .session(currentSession);
    
            if (conflict) {
              if (ownSession) await currentSession.abortTransaction();
              return BuildMethodResponse({
                success: false,
                status: "Fallido",
                message: `No se actualizó el afiliado porque ya existe otro con el mismo Id externo ${updateData.externalId}`
              });
            }
          }
    
          // Perform update
          const affiliate = await Affiliate.findByIdAndUpdate(
            affiliateId,
            updateData,
            {
              new: true,
              runValidators: true,
              session: currentSession
            }
          );
    
          if (!affiliate) {
            if (ownSession) await currentSession.abortTransaction();
            return BuildMethodResponse({
              success: false,
              status: "Fallido",
              message: "Afiliado no encontrado"
            });
          }
    
          if (ownSession) await currentSession.commitTransaction();
          return BuildMethodResponse({
            success: true,
            status: "Actualizado",
            message: "El afiliado ha sido actualizado",
            externalId: affiliate.externalId,
            fullName: affiliate.fullName
          });
        } catch (error) {
          console.error(error);
          if (ownSession) await currentSession.abortTransaction();
          return BuildMethodResponse({
            success: false,
            status: "Error Fatal",
            message: "Error al actualizar el afiliado"
          });
        } finally {
          if (ownSession) currentSession.endSession();
        }
      }

      static async getEventReport(eventId) {
        try {
          const attendances = await Attendance.find({ event: eventId });
    
          const confirmed = attendances.filter(a => a.confirmed).length;
          const notConfirmed = attendances.filter(a => !a.confirmed).length;
          const attended = attendances.filter(a => a.attended).length;
          const confirmedButDidNotAttend = attendances.filter(a => a.confirmed && !a.attended).length;
    
          return BuildMethodResponse({
            success: true,
            status: "Éxito",
            message: "Reporte de evento generado",
            data: {
              totalAttendances: attendances.length,
              confirmed,
              notConfirmed,
              attended,
              confirmedButDidNotAttend
            }
          });
        } catch (error) {
          console.error(error);
          return BuildMethodResponse({
            success: false,
            status: "Fallido",
            message: "Error generando reporte del evento",
          });
        }
      }

    static async searchAffiliates(query, session = null) {
        const currentSession = session || (await mongoose.startSession());
        if (!session) currentSession.startTransaction();
        try {
            const affiliates = await Affiliate.find(query).session(currentSession);
            if (!session) await currentSession.commitTransaction();


            return BuildMethodResponse({ success: true, status: "Correcto", message: "Los Afiliados han sido buscados", data: affiliates });
        } catch (error) {
            if (!session) await currentSession.abortTransaction();
            return { success: false, message: error.message };
        } finally {
            if (!session) currentSession.endSession();
        }
    }

    // Deactivate (cancel) an affiliate
    static async deactivateAffiliate(affiliateId, session = null) {
        const currentSession = session || (await mongoose.startSession());
        if (!session) currentSession.startTransaction();

        try {
            const affiliate = await Affiliate.findByIdAndUpdate(
                affiliateId,
                { active: false },
                { new: true, session: currentSession }
            );
            if (!affiliate) return { success: false, message: "Affiliate not found" };
            if (!session) await currentSession.commitTransaction();
            return { success: true, affiliate };
        } catch (error) {
            if (!session) await currentSession.abortTransaction();
            return { success: false, message: error.message };
        } finally {
            if (!session) currentSession.endSession();
        }
    }

    // Register a user's attendance to an affiliate
    static async registerAttendance(affiliateId, userId, session = null) {
        const currentSession = session || (await mongoose.startSession());
        if (!session) currentSession.startTransaction();

        try {
            const affiliate = await Affiliate.findById(affiliateId).session(
                currentSession
            );
            if (!affiliate) return { success: false, message: "Affiliate not found" };
            // Avoid duplicate attendance
            if (!affiliate.attendances.includes(userId)) {
                affiliate.attendances.push(userId);
            }
            await affiliate.save({ session: currentSession });
            if (!session) await currentSession.commitTransaction();
            return { success: true, affiliate };
        } catch (error) {
            if (!session) await currentSession.abortTransaction();
            return { success: false, message: error.message };
        } finally {
            if (!session) currentSession.endSession();
        }
    }
}

module.exports = AffiliateService;
