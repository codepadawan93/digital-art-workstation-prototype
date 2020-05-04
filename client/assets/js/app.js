const App = (function(){

   const App = {};
   App.isLoading = false;

   let _getRandomString = len => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < len; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
   }

   let _attachEventHandler = (id, event, callback) => {
       const doc = App._document;
       const el = doc.getElementById(id);
       el.addEventListener(event, _event => {
           callback(el, _event);
       });
   }

   let _addError = (id, text) => {
       const doc = App._document;
       const el = doc.getElementById(id);
       const generatedId = `error_` + id + `_${_getRandomString(16)}`;
       const tpl = `<div class="alert alert-dismissible alert-primary" id="${generatedId}">${text}</div>`;
       el.insertAdjacentHTML("beforebegin", tpl);
       setTimeout(()=>{
            const msg = doc.getElementById(generatedId);
            msg.parentNode.removeChild(msg);
       }, 2000);
   };

   let _validateForm = (model, params) => {
       let answer = true;
       if(!model.image || model.image.size <= 0){
           _addError("fileInput", "An image file is required.");
           answer = false;
       }
       if(!model.algorithm || model.algorithm.length <= 0){
            _addError("algorithmSelect", "An algorithm is required.");
            answer = false;
       }
       if(model.image && params.allowedImageTypes.indexOf(model.image.type) < 0){
            _addError("fileInput", `Only ${params.allowedImageTypes.join(' ')} images are supported.`);
            answer = false;
       }
       return answer;
   };

   let _toggleLoad = () => {
       App.isLoading = !App.isLoading;
       const el = App._document.getElementById("loadingBar");
       const image = App._document.getElementById("canvas");
       if(App.isLoading){
           el.style = "display : flex";
           image.style = "opacity: 0.5";
       } else {
           el.style = "display : none";
           image.style = "opacity: 1";
       }
   }

   let _getSettings = () => {
        const settings = {};
        const formData = new FormData(App._document.getElementById('imageForm'));
        for(const tuple of formData.entries()) {
            if(typeof tuple[1] === "string"){
                settings[tuple[0]] = parseInt(tuple[1]);
            }
        }
        return settings;
   }

    let _setText = (id, text) => {
        const el = App._document.getElementById(id);
        el.value = text;
    };

    let _call = (callback) => {
        const options = _getSettings();
        const imageData = App._ctx.getImageData(0, 0, App._canvas.width, App._canvas.height);
        imageData.data = callback(imageData.data, options);
        App._ctx.putImageData(imageData, 0, 0);
    };

   App.init = _document => {
        App._document = _document;
        App._canvas = document.getElementById("canvas");
        App._ctx = App._canvas.getContext("2d");
        // Refactor
        ["increment", "rOffset", "gOffset", "bOffset"].forEach((el, index) => {
            _attachEventHandler(el, "change", (el, event) => {
                _call((data, options) => {
                    const outData = data;
                    for(let i = 0; i < data.length; i += options.increment){
                        outData[i+0] = options.rValue ? options.rValue : outData[i+options.rOffset]; // r
                        outData[i+1] = options.gValue ? options.gValue : outData[i+options.gOffset]; // g
                        outData[i+2] = options.bValue ? options.bValue : outData[i+options.bOffset]; // b
                        outData[i+3] = options.aValue ? options.aValue : outData[i+options.aOffset]; // a
                    }
                    return outData;
                });
            })
        });

        _attachEventHandler("fileInput", "change", (el, event) => {
            _toggleLoad();
            event.preventDefault();
            const file = el.files[0];
            const image = App._document.createElement("img");
            image.src = URL.createObjectURL(file);
            image.onload = () => {
                App._canvas.width = image.width;
                App._canvas.height = image.height;
                App._ctx.drawImage(image, 0, 0);
                _toggleLoad();
            };
            image.onerror = () => {
                _addError("imageForm", "Image could not be loaded");
                _toggleLoad();
            };
        });

        _attachEventHandler("downloadBtn", "click", (el, event) => {
            event.preventDefault();
            const link = App._document.createElement('a');
            link.href = App._canvas.toDataURL("jpeg");
            link.download = `output_${_getRandomString(8)}.jpeg`;
            App._document.body.appendChild(link);
            link.click();
            App._document.body.removeChild(link);
        });
   };
   return App;
})();