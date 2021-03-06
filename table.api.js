window.onload = function() {
    try {
        var tabla = document.getElementById(jsonObject.tableId);
        var botonesCrearFila = document.getElementsByClassName(jsonObject.addButton);
        var cantidadCeldasInicial = jsonObject.totalCells;
        
        /**
         * 1- Obtener el número de filas
         * 2- Crear un nuevo elemento de tipo td
         * 3- Obtener el número de celdas de la fila anterior para crear la 
         *    misma cantidad en la nueva fila.
         * 4- Se crean las nuevas celdas en función a la cantidad de celdas
         *    de la fila anterior.
         */
        function crearFila(evento) {
            var tableBody = tabla.tBodies[0];
            var totalFilas = tableBody.rows.length;
            var totalCeldas = cantidadCeldasInicial;
            var filaActual = totalFilas;

            //Se crea una nueva fila
            tableBody.appendChild(agregarFila(filaActual));

            for (var c = 0; c < totalCeldas; c++) {
                /*
                * Esta validación determina si queremos colocar un elemento
                * especial en la última celda de la última fila creada. 
                */
                if (c == (totalCeldas - 1)) {
                    var botonBorrar = crearElemento(jsonObject.deleteButton);
                    botonBorrar.onclick = borrarFila;

                    tableBody.rows[filaActual]
                    .insertCell(c)
                    .appendChild(botonBorrar);
                } else {
                    tableBody.rows[filaActual]
                    .insertCell(c)
                    .appendChild(crearElemento(jsonObject.cellElement[c]));
                }
            }

            /*
             * Se obtienen todos los botones que se encargan de borrar su respectiva fila y se les 
             * agrega la función de borrado.
             */
            var botonesBorrarFila = document.getElementsByClassName(jsonObject.deleteButton.class);

            for (var f in botonesBorrarFila) {
                botonesBorrarFila[f].onclick = borrarFila; 
            }
        };
        
        /**
         * Método encargado de borrar una fila seleccionada.
         * 
         * @param {MouseEvent} evento 
         */
        function borrarFila(evento) {
            //Se declara el table body actual.
            var tableBody = tabla.tBodies[0];

            //Se declara el ID de la primera fila. 
            var primeraFila = 0;
            
            //Se declara el ID de la última fila.
            var ultimaFila = tableBody.rows.length - 1;
            
            //Se obtiene el ID de la fila que se esta borrando.
            var idFila = evento.srcElement.parentElement.parentElement.getAttribute("data-fila");
            
            //Se valida si se esta borrando la primera fila 
            if (idFila == primeraFila) {
                //Se borra la fila
                tableBody.deleteRow(evento.srcElement.parentElement.parentElement.getAttribute("data-fila"));
                
                /*
                * Se realiza un recorrido por las filas que quedaron y se 
                * les reasigna un nuevo ID de fila. Esto se hace para evitar
                * borrar una fila cuyo indice no exista dentro del listado de
                * filas de elemento tbody.
                */
                for (var i = idFila; i < tableBody.rows.length; i++) {
                    tableBody.rows[i].setAttribute("data-fila", i);
                }
            }
            
            if (idFila > primeraFila && idFila < ultimaFila) {
                tableBody.deleteRow(evento.srcElement.parentElement.parentElement.getAttribute("data-fila"));
                
                for (var i = idFila; i < ultimaFila; i++) {
                    tableBody.rows[i].setAttribute("data-fila", i);
                }
            }
            
            //Se borra la fila seleccionada.
            if (idFila == ultimaFila && tableBody.rows.length > 0) {
                tableBody.deleteRow(evento.srcElement.parentElement.parentElement.getAttribute("data-fila"));
            }

            var botonesBorrarFila = document.getElementsByClassName(jsonObject.deleteButton.class);

            for (var f in botonesBorrarFila) {
                botonesBorrarFila[f].onclick = borrarFila;
            }
        };

        /**
         * Método encargado de crear un elemento HTML especifico para cada celda.
         * 
         * @returns {HTMLElementTagNameMap}:    Retorna el objeto DOM del tipo de elemento requerido.
         */
        function crearElemento(elemento) {
            var element = document.createElement(elemento.element);
            
            //Se verifica si el elemento name esta definido.
            if (elemento.name !=  undefined && elemento.name != null) {
                element.setAttribute("name", elemento.name);
            }

            //Valida que el atributo type este definido.
            if (elemento.type != undefined && elemento.type != null) {
                element.setAttribute("type", elemento.type);
            }

            //Valida que el atributo class este definido.
            if (elemento.class != undefined && elemento.class != null) { 
                element.setAttribute("class", elemento.class); 
            }

            //Se verifica si el elemento text esta definido.
            if (elemento.text != undefined && elemento.text != null) {
                var textNode = document.createTextNode(elemento.text);
                element.appendChild(textNode);
            }

            //Crea nuevos elementos de tipo options para una lista de tipo select.
            if (elemento.options != null && elemento.options.length > 0) {
                for (var o in elemento.options) {
                    var option = document.createElement(elemento.options[o].element);
                    var text = document.createTextNode(elemento.options[o].text);
                    option.setAttribute("value", elemento.options[o].value);
                    option.appendChild(text);

                    element.appendChild(option);
                }
            }

            //Creación de elementos tipo radio y elementos tipo checkbox
            if (element.type == "radio" || element.type == "checkbox") {
                element = document.createElement("span");

                if (elemento.radioElements != undefined || elemento.radioElements != null) {
                    for (var r in elemento.radioElements) {
                        var radioCheckboxElement = document.createElement(elemento.element);
                        radioCheckboxElement.setAttribute("type", elemento.type);
                        radioCheckboxElement.setAttribute("name", elemento.name);
                        radioCheckboxElement.setAttribute("value", elemento.radioElements[r].value);

                        element.appendChild(radioCheckboxElement);
                        element.appendChild(crearElemento(elemento.radioElements[r]));
                    }
                }
            }

            //Creación de un nuevo datalist.
            if (elemento.list != undefined && elemento.list != null) {
                element = document.createElement("input");
                element.setAttribute("list", elemento.list);

                if (!validateObject(document.getElementById(elemento.list))) {
                    preloadDataToDataList(elemento.options, null, elemento.list);
                }

                element.onblur = addDataToDataList;
            }

            return element;
        }

        /**
         * Método encargado de crear una nueva fila para un elemento table.
         * 
         * @returns {HTMLElementTagNameMap}:    Retorna el objeto DOM de tipo tr
         */
        function agregarFila(numFila) {
            var fila = document.createElement("tr");
            fila.setAttribute("data-fila", numFila);
            return fila;
        }

        /**
         * Agrega un nuevo elemento a un datalist. En caso de que el elemento datalist no exista, se crea y se
         * agrega al body del documento.
         * 
         * @param {FocusEvent} object   El objeto con la información del evento lanzado.
         */
        function addDataToDataList(object) {
            if (validateObject(object.srcElement.getAttribute("list")) && validateObject(object.srcElement.list)) {
                createOptionValueToDataList(
                    object.srcElement.list, 
                    object.srcElement.value, 
                    object.srcElement.value);
            } else {
                var datalist = document.createElement("datalist");
                datalist.setAttribute("id", object.srcElement.getAttribute("list"));

                createOptionValueToDataList(
                    datalist, 
                    object.srcElement.value,
                    object.srcElement.value);

                document.body.appendChild(datalist);
            }
        }

        /**
         * Precarga en un datalist, la información de los options value a visualizar.
         * 
         * @param {HTMLAllCollection}   element         El listado de elementos de tipo option a precargar.
         * @param {HTMLDataListElement} list            El elemento de tipo list.
         * @param {Text}                dataListName    El nombre para el nuevo datalist.
         */
        function preloadDataToDataList(element, list, dataListName) {
            if (validateList(element) && validateObject(list)) {
                for (var o in element) {
                    createOptionValueToDataList(list, element[o].value, element[o].innerHTML);
                }
                
            } else if (validateList(element)) {
                var datalist = document.createElement("datalist");
                datalist.setAttribute("id", dataListName);

                for (var o in element) {
                    createOptionValueToDataList(datalist, element[o].value, element[o].text);
                }

                document.body.appendChild(datalist);
            }
        }

        /**
         * Crea una nueva opción para el datalist.
         * 
         * @param {HTMLDataListElement} datalist        El objeto de tipo datalist.
         * @param {Text} value                          El valor para el option nuevo a asociar al datalist.
         * @param {Text} label                          El valor de tipo texto a colocar como enunciado para el valor 
         *                                              del elemento option.
         */
        function createOptionValueToDataList(datalist, value, label) {
            if (isNotEmpty(value) && isNotEmpty(label) && !optionExistsIntoDataList(datalist, label)) {
                var option = document.createElement("option");
                option.appendChild(document.createTextNode(label));
                option.setAttribute("value", value);
                datalist.appendChild(option);
            }
        }

        /**
         * Valida si un nuevo valor que se esta ingresando para el datalist ya existe dentro del listado de opciones.
         * 
         * @param {HTMLDatalistElement} datalist        El datalist con todas las opciones.
         * @param {Text} label                          El nombre del nuevo valor que se ha ingresado.
         * @return {Boolean}                            Retorna TRUE si el valor ya existe dentro del listado.
         */
        function optionExistsIntoDataList(datalist, label) {
            if (validateObject(datalist) && validateList(datalist.childNodes)) {
                for (o in datalist.childNodes) {
                    if (label == datalist.childNodes[o].text) {
                        return true;
                    }
                }
            }
        }

        /**
         * Valida si esta definido un objeto.
         * 
         * @param {HTMLElement} element 
         */
        function validateObject(element) {
            return element != undefined && element != null;
        }

        /**
         * Valida si un listado de options esta definido y tiene datos.
         * 
         * @param {HTMLOptionElement} element       El listado de elementos de tipo option a ser validado. 
         */
        function validateList(element) {
            return validateObject(element) && element.length > 0;
        }

        function isNotEmpty(data) {
            return (data != null && data != "");
        }

        /*
         * A cada fila se le agrega un atributo de tipo dataset para identificar 
         * el número de fila en próximas validaciones. 
         */
        for (var f = 0; f < tabla.tBodies[0].rows.length; f++) {
            tabla.tBodies[0].rows[f].setAttribute("data-fila", f);
        }
        
        for (var f in botonesCrearFila) {
            botonesCrearFila[f].onclick = crearFila;
        }
    } catch (excepcion) {
        this.console.error(excepcion.message);
        this.console.error("Los par\u00E1metros para la tabla no est\u00E1n definidos. Construye el objeto JSON con la estructura definida en https://elle184.github.io/TableJsApi/");
    }
};