const Product = require("../models/productModel");

const getProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const { name, companyId } = req.query;
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (companyId) {
      filter.companyId = companyId;
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "companyId",
        select: "name country website legalNumber", 
      });

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products,
    });
  } catch (error) {
    console.error("Error fetching products with company data:", error);
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

const getLastAddedProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching the latest products:", error);
    res.status(500).json({ message: "Failed to fetch the latest products." });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, category, amount, unit, companyId } = req.body;
    const product = await Product.findOne({ name, category, companyId });
    if (product) {
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          $set: {
            amount: product.amount + amount,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    }

    const newProduct = new Product({
      name,
      category,
      amount,
      unit,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedProduct = await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: savedProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Failed to add product." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, category, amount } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          name: name || product.name,
          category: category || product.category,
          amount: amount || product.amount,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found or update failed" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product." });
  }
};

const productChartData = async (req, res) => {
  try {
    const products = await Product.find();
    let a =[];
    const categoryData = products.map((product) => {
      let category = product.category;
      let existingCategory = a.find((item) => item.category === category);
      if (existingCategory) {
        existingCategory.amount += product.amount;
      } else {
        a.push({ category, amount: product.amount });
      }
      
    })
    
    res.status(200).json(a);
  } catch (error) {
    console.error("Error fetching product chart data:", error);
    res.status(500).json({ message: "Failed to fetch product chart data." });
  }
};

module.exports = {
  getProduct,
  getLastAddedProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  productChartData,
};
