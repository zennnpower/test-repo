const arguments = process.argv.slice(2)
let arguments_string = arguments[0].split(",").join("")

let add = (a, b) => {
  let sum = (a + b + 10)
  return sum
}

let a = parseInt(arguments_string[0])
let b = parseInt(arguments_string[1])
let expectedResult = parseInt(arguments_string[2])

console.log(add(a, b) === expectedResult)