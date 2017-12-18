let calender = module.exports = {

  load: (element) => {

	root.calender = element;

    var a = moment('2016-01-01'); 
    var b = a.add(1, 'week'); 
    a.format();

    console.log(a);

  },

};