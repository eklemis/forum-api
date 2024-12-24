exports.up = (pgm) => {
  pgm.addColumn("comments", {
    like_count: {
      type: "INTEGER",
      default: 0,
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("comments", "like_count");
};
