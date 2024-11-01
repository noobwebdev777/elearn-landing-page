const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const rollup = require("gulp-rollup");
const babel = require("rollup-plugin-babel");
const { terser } = require("rollup-plugin-terser");

// Function to load Autoprefixer
async function loadAutoprefixer() {
  const autoprefixer = (await import("gulp-autoprefixer")).default;
  return autoprefixer;
}

// Compile Sass, Autoprefix, Minify, and Uglify CSS
gulp.task("sass", async function () {
  const autoprefixer = await loadAutoprefixer();
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(gulp.dest("./public/css")) // Save non-minified CSS
    .pipe(cleanCSS()) // Minify CSS
    .pipe(rename({ suffix: ".min" })) // Rename to .min.css
    .pipe(gulp.dest("./public/css")) // Save minified CSS
    .pipe(browserSync.stream()); // Inject CSS changes
});

// Rollup configuration for bundling JavaScript
const rollupConfig = {
  input: "./src/js/main.js", // Entry point of your JavaScript
  output: {
    file: "./public/js/bundle.js", // Output bundle file
    format: "es", // You can change to 'cjs', 'es', etc.
    sourcemap: true, // Generate sourcemaps
  },
  plugins: [
    babel({
      exclude: "node_modules/**", // Exclude dependencies
      presets: ["@babel/preset-env"], // Use Babel preset for modern JavaScript
    }),
    terser(), // Minify the output
  ],
};

// Gulp task for JavaScript with Rollup
gulp.task("scripts", () => {
  return gulp
    .src("./src/js/**/*.js") // Source JavaScript files
    .pipe(rollup(rollupConfig))
    .pipe(gulp.dest("./public/js")); // Output destination
});

// Serve and watch HTML/Sass/image files
gulp.task("serve", function () {
  browserSync.init({
    server: {
      baseDir: "./",
    },
    port: 5173,
    open: false,
    notify: false,
  });

  gulp.watch("./*.html").on("change", browserSync.reload);
  gulp.watch("./src/css/*.css").on("change", browserSync.reload);
  gulp.watch("./src/scss/**/*.scss", gulp.series("sass"));
  gulp.watch("./src/js/**/*.js", gulp.series("scripts")); // Watch for JavaScript changes
  gulp.watch("./src/images/**/*.{jpg,jpeg,png,gif}", browserSync.reload);
});

// Default task
gulp.task("default", gulp.series("sass", "scripts", "serve"));
