const AffiliateService = require("../services/AffiliateService");

const AffiliateController = {
  create: async (req, res) => {
    try {
      const affiliateData = req.body;
      const update = req.query.update == "true"
      
      const result = await AffiliateService.createAffiliate(affiliateData, update);
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false, 
        error: error.message 
      });
    }
  },
  getReport: async (req, res) => {
    try {
      const affiliateId = req.params.id;
      const result = await AffiliateService.getAffiliateReport(affiliateId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  bulkCreate: async (req, res) => {
    try {
      const affiliatesDataArray = req.body;
      const update = req.query.update == "true"

      // Validate input
      if (!Array.isArray(affiliatesDataArray)) {
        return res
          .status(400)
          .json({ success: false, message: "Se espera un arreglo de afiliados." });
      }

      const results = await AffiliateService.createManyAffiliates(
        affiliatesDataArray,
        update,
      );

      // Return array of per-item responses
      return res.status(200).json({ success: true, results });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Error al crear los afiliados en lote." });
    }
  },

  update: async (req, res) => {
    try {
      const affiliateId = req.params.id;
      const updateData = req.body;
      const result = await AffiliateService.updateAffiliate(affiliateId, updateData);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const query = req.query;
      const result = await AffiliateService.searchAffiliates(query);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deactivate: async (req, res) => {
    try {
      const affiliateId = req.params.id;
      const result = await AffiliateService.deactivateAffiliate(affiliateId);
      if (result.success) {
        res.status(200).json(result.affiliate);
      } else {
        res.status(404).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  

  registerAttendance: async (req, res) => {
    try {
      const affiliateId = req.params.id;
      const { userId } = req.body;
      const result = await AffiliateService.registerAttendance(affiliateId, userId);
      if (result.success) {
        res.status(200).json(result.affiliate);
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = AffiliateController;
