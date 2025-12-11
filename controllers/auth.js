import { validateRegister } from "../schemas/validRegister.js";

export class AuthController {
    constructor({ authModel }) {
        this.authModel = authModel;
    }

    login = async (req, res) => {
        //validamos con zod
        /*const result = validateLogin(req.body);
         if (result.error) {
            // Parseamos el error de Zod
            const parsedError = JSON.parse(result.error.message);
        
            // Iteramos sobre los errores para agregar el valor ingresado por el usuario
            const formattedErrors = parsedError.map((err) => {
                // Obtenemos el valor que el usuario ingresó para el campo específico
                const userValue = req.body[err.path[0]];  // `err.path[0]` es el campo que causó el error
        
                // Modificamos el mensaje para incluir el valor ingresado
                return {
                    ...err,
                    userValue: userValue  // Añadimos el valor ingresado por el usuario al error
                };
            });
        
            // Imprimimos los errores con el valor ingresado para enviar al frontend
            console.log("Error que se enviará al front:", formattedErrors);
        
            // Devolvemos los errores con el valor ingresado
            return res.status(400).json({ error: formattedErrors });
        } */
        // enviamos los datos
        const login = await this.authModel.login({ input: req.body });

        if (!login.valid) return res.status(401).json(login.message);

        return res.status(200).json(login);
    }

    register = async (req, res) => {
        const result = validateRegister(req.body);
        if (result.error) {
            // Parseamos el error de Zod
            const parsedError = JSON.parse(result.error.message);

            // Iteramos sobre los errores para agregar el valor ingresado por el usuario
            const formattedErrors = parsedError.map((err) => {
                // Obtenemos el valor que el usuario ingresó para el campo específico
                const userValue = req.body[err.path[0]];  // `err.path[0]` es el campo que causó el error

                // Modificamos el mensaje para incluir el valor ingresado
                return {
                    ...err,
                    userValue: userValue  // Añadimos el valor ingresado por el usuario al error
                };
            });

            // Imprimimos los errores con el valor ingresado para enviar al frontend
            console.log("Error que se enviará al front:", formattedErrors);

            // Devolvemos los errores con el valor ingresado
            return res.status(400).json({ error: formattedErrors });
        }

        const info = await this.authModel.registrar({ input: result.data});

        console.log(info);
        return res.status(201).json(result);
    }
}