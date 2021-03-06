LIB_DIR   = src/lib/
TUNER_DIR = src/tuner/
VIEWS_DIR = src/views/

BUILD_DIR = src/build/
DIST_DIR  = $(BUILD_DIR)dist/

MINIFIER       = yui-compressor
MINIFIER_FLAGS = --type js --preserve-semi --nomunge -o

LIBS = $(LIB_DIR)common.js      \
	$(LIB_DIR)circularbuffer.js   \
	$(LIB_DIR)frequencymap.js     \
	$(LIB_DIR)windowfunctions.js  \
	$(LIB_DIR)pitchdetection.js

TUNER = $(TUNER_DIR)tuner.js

VIEWS = $(VIEWS_DIR)common.js \
	$(VIEWS_DIR)simple.js       \
	$(VIEWS_DIR)centsgauge.js

tuner: $(LIBS) $(TUNER)
	mkdir -p $(DIST_DIR)
	echo -e "(function (global) {\n" > $(DIST_DIR)tuner.js
	awk 'FNR==1{print ""}1' $(LIBS) $(TUNER) >> $(DIST_DIR)tuner.js
	echo -e "global.Tuner = Tuner;\n}(window));" >> $(DIST_DIR)tuner.js
	$(MINIFIER) $(DIST_DIR)tuner.js $(MINIFIER_FLAGS) $(DIST_DIR)tuner-min.js
	gzip --best -c $(DIST_DIR)tuner-min.js > $(DIST_DIR)tuner-min.js.gz

views: $(VIEWS)
	mkdir -p $(DIST_DIR)
	cat $(VIEWS) > $(DIST_DIR)views.js
	$(MINIFIER) $(DIST_DIR)views.js $(MINIFIER_FLAGS) $(DIST_DIR)views-min.js
	gzip --best -c $(DIST_DIR)views-min.js > $(DIST_DIR)views-min.js.gz
