exports.up = (pgm) => {
  pgm.addColumn("comments", {
    is_delete: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("comments", "is_delete");
};
