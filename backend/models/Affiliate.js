const mongoose = require("mongoose");

const AffiliateSchema = new mongoose.Schema({
    externalId: { type: String, required: true },
    firstName: { type: String, required: true, unique: false },
    secondName: { type: String, required: false, unique: false },
    firstLastName: { type: String, required: true, unique: false },
    secondLastName: { type: String, required: true, unique: false },
    email: { type: String, required: true },
    telephoneNumber: { type: String, required: true },
    active: { type: Boolean, required: true, default: true }
});

AffiliateSchema.virtual('fullName').get(function () {
    return [this.firstName, this.secondName, this.firstLastName, this.secondLastName]
        .filter(Boolean)
        .join(' ');
});

AffiliateSchema.set('toJSON', { virtuals: true });
AffiliateSchema.set('toObject', { virtuals: true });


const Affiliate = mongoose.model("Affiliate", AffiliateSchema);
module.exports = Affiliate;
