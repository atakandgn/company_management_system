const Company = require("../models/companyModel");
const Product = require("../models/productModel");

const getCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const { name, country, id } = req.query;
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    if (country) {
      filter.country = country;
    }

    if (id) {
      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found." });
      }
      return res.status(200).json(company);
    }

    const companies = await Company.find(filter).skip(skip).limit(limit);

    const totalCompanies = await Company.countDocuments(filter);

    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(totalCompanies / limit),
      totalCompanies,
      companies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Failed to fetch companies." });
  }
};

const getLastAddedCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .sort({ createdAt: -1 })  
      .limit(3); 

    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching the latest companies:", error);
    res.status(500).json({ message: "Failed to fetch the latest companies." });
  }
};


const addCompany = async (req, res) => {
  try {
    const { name, legalNumber, country, website } = req.body;

    if (!name || !legalNumber || !country) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const existingCompany = await Company.findOne({
      $or: [{ name }, { legalNumber }, { website }],
    });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists." });
    }

    const newCompany = new Company({
      name,
      legalNumber,
      country,
      website,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newCompany.save();

    res
      .status(201)
      .json({ message: "Company added successfully", company: newCompany });
  } catch (error) {
    console.error("Error adding company:", error);
    res.status(500).json({ message: "Failed to add company." });
  }
};

const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { name, legalNumber, country, website } = req.body;
    const oldCompany = await Company.findById(companyId);
    if (!oldCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      {
        $set: {
          name: name || oldCompany.name,
          legalNumber: legalNumber || oldCompany.legalNumber,
          country: country || oldCompany.country,
          website: website || oldCompany.website,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedCompany) {
      return res
        .status(404)
        .json({ message: "Company not found or update failed" });
    }

    res.status(200).json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: "Failed to update company." });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const products = await Product.find({ companyId });
    if (products.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete company with associated products" });
    }

    await Company.findByIdAndDelete(companyId);

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ message: "Failed to delete company." });
  }
};

const companyChartData = async (req, res) => {
  try {
    const companies = await Company.find();
    const companyCountries = companies.map((company) => company.country);
    const countries = [...new Set(companyCountries)];
    const countryData = countries.map((country) => {
      return {
        country,
        count: companyCountries.filter((compCountry) => compCountry === country)
          .length,
      };
    });
    countryData.sort((a, b) => b.count - a.count);
    res.status(200).json(countryData.slice(0, 5));
  } catch (error) {
    console.error("Error fetching company data:", error);
    res.status(500).json({ message: "Failed to fetch company data." });
  }
};

module.exports = {
  getCompanies,
  getLastAddedCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
  companyChartData,
};
