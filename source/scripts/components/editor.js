let editor = module.exports = {

  load_course: (element) => {

    let key = history.state.course,
        course = root.courses.memory[key];

    console.log(course);

  }

};