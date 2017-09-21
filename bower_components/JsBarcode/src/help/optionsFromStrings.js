export default optionsFromStrings;

// Convert string to integers/booleans where it should be
function optionsFromStrings(options){
  var intOptions = [
    "width",
    "height",
    "textMargin",
    "fontSize",
    "margin",
    "marginLeft",
    "marginBottom",
    "marginLeft",
    "marginRight"
  ];

  for(var intOption in intOptions){
    intOption = intOptions[intOption];
    if(typeof options[intOption] === "string"){
      options[intOption] = parseInt(options[intOption], 10);
    }
  }

  if(typeof options["displayValue"] === "string"){
    options["displayValue"] = (options["displayValue"] != "false");
  }

  return options;
}
