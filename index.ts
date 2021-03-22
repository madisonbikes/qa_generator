import csv from "csv-parser";
import fs from "fs";
const temp_results: any[] = [];
const QUESTION_COUNT = 7;

fs.createReadStream("answers.csv")
  .pipe(csv(["Timestamp", "Name", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"]))
  .on("data", (data: any) => {
    temp_results.push(data);
  })
  .on("end", () => {
    write(temp_results);
  });

async function write(results: any[]) {
  const output = fs.createWriteStream("output.html");
  for (let i = 1; i <= QUESTION_COUNT; i++) {
    if (i == 6) {
      // skip the go on a ride question
      continue;
    }
    output.write(`<a name="Q${i}"></a><h2>Question ${i}</h2>\n`);
    let questionText = results[0][`Q${i}`] as String;

    // strip out "Q3: " header to some questions"
    const matched = questionText.match("Q\\d+:\\s*(.*)");
    if (matched) {
      questionText = matched[1];
    }
    output.write(`<p><i>${questionText}</i></p>`);

    for (let responder = 1; responder < results.length; responder++) {
      const response = results[responder];
      output.write(`<h3>${response["Name"]}</h3>\n`);
      let responseText = response[`Q${i}`] as String;
      responseText = responseText.trim();
      responseText = responseText.replace("\n", "</p><p>");
      output.write(`<p>${responseText}</p>`);
      output.write("\n");
    }
    output.write("\n");
  }

  output.close();
}
