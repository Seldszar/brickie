window.settings = {
  /**
   * The channel name where the widget is associated.
   * @type {String}
   */
  channel: "realjameskii",

  /**
   * The minimum amount of emotes for showing the combo.
   * @type {Number}
   */
  threshold: 3,

  /**
   * The font used by the widget.
   * @type {Object}
   */
  font: {
    /**
     * The font provider ("local", "google").
     * @type {String}
     */
    provider: "local",

    /**
     * The font family.
     * @type {String}
     */
    family: "Comic Sans MS",

    /**
     * The font weight.
     * @type {Number}
     */
    weight: 700,
  },

  /**
   * The users excluded from the combo counter (case insensitive).
   * @type {Array<String>}
   */
  excludedUsers: [],

  /**
   * Hide the credits displayed from time to time about the author and project.
   * @type {Boolean}
   */
  hideCredits: false,
};
