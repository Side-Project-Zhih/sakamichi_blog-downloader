module.exports.dectectRepeat = (date) =>{
  const repeat = {};
  date = date.map((item, i, arr) => {
    if (arr.indexOf(item) !== i)
      if (repeat[item]) {
        repeat[item] += 1;
        const index = repeat[item];
        return item + "-" + index;
      } else {
        repeat[item] = 1;
        const index = repeat[item];
        return item + "-" + index;
      }
    else {
      return item;
    }
  });
  return date;
} 
