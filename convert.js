const sharp = require("sharp");

const input = "uploads/0aa68bf4a0046ff503f172061b4ee120";
const output = input + ".jpg";

sharp(input)
  .jpeg()
  .toFile(output)
  .then(() => console.log("Converted to JPG"))
  .catch(err => console.log(err));