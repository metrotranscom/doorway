const secretarn = "arn:aws:secretsmanager:us-west-2:364076391763:secret:/doorway/dev2/CLOUDINARY_KEY"
const cleanArn = secretarn.replace(/(-[A-Za-z0-9]{6}):.*$/, '$1');
console.log(cleanArn)