import csv from "csv-parser";
import fs from "fs";
const temp_results: any[] = [];

process.on("uncaughtException", (err) => {
  console.error(err);
  process.exit(1);
});

if (process.argv.length != 4) {
  console.log("Requires two arguments, input csv and output html file");
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

const QUESTION_COUNT = 7;

fs.createReadStream(inputFile)
  .pipe(
    csv([
      "Timestamp",
      "Name",
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      "Q5",
      "Q6",
      "Q7",
      "District",
    ])
  )
  .on("data", (data: any) => {
    temp_results.push(data);
  })
  .on("end", () => {
    write(temp_results);
  });

function write(results: any[]) {
  // sort by district, then last name
  results.sort((a, b) => {
    const district = a.District - b.District;
    if (district != 0) {
      return district;
    }
    const aLastName = a.Name.split(" ").slice(-1).join(" ");
    const bLastName = b.Name.split(" ").slice(-1).join(" ");
    return aLastName < bLastName ? -1 : 1;
  });

  const output = fs.createWriteStream(outputFile);

  for (let responder = 1; responder < results.length; responder++) {
    const response = results[responder];
    output.write(`<a name="District${response["District"]}"></a>`);
    output.write(
      `<h3>${response["Name"]} - District ${response["District"]}</h3>\n`
    );

    for (let i = 1; i <= QUESTION_COUNT; i++) {
      if (i == 6) {
        // skip the go on a ride question
        continue;
      }
      //output.write(`<a name="Q${i}"></a><h2>Question ${i}</h2>\n`);
      let questionText = results[0][`Q${i}`];

      // strip out "Q3: " header to some questions"
      //const matched = questionText.match("Q\\d+:\\s*(.*)");
      //if (matched) {
      //  questionText = matched[1];
      //}

      let responseText = response[`Q${i}`];
      responseText = responseText.trim();
      responseText = responseText.replace("\n", "</p><p>");
      if (responseText.length > 0) {
        output.write(`<h4><i>${questionText}</i></h4>`);

        output.write("\n");
        output.write(`<p>${responseText}</p>`);
        output.write("\n");
      }
    }
  }

  output.close();
}
