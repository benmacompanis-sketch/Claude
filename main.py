# EquiTask - Gestor de reparto equitativo de tareas
# Dificultades: 1 = Fácil, 2 = Media, 3 = Difícil


def ingresar_datos():
    integrantes = []
    tareas = []

    # Carga de integrantes
    cantidad_integrantes = int(input("¿Cuántos integrantes hay en el grupo? "))

    for i in range(cantidad_integrantes):
        nombre = input("Nombre del integrante " + str(i + 1) + ": ")
        integrantes.append(nombre)

    # Carga de tareas
    cantidad_tareas = int(input("\n¿Cuántas tareas se van a ingresar? "))

    for i in range(cantidad_tareas):
        nombre_tarea = input("\nNombre de la tarea " + str(i + 1) + ": ")

        # Se repite la pregunta hasta que la dificultad sea 1, 2 o 3
        dificultad = input("Dificultad (1 = Fácil, 2 = Media, 3 = Difícil): ")
        while dificultad != "1" and dificultad != "2" and dificultad != "3":
            print("Valor no válido. La dificultad debe ser 1, 2 o 3.")
            dificultad = input("Dificultad (1 = Fácil, 2 = Media, 3 = Difícil): ")

        tarea = {"nombre": nombre_tarea, "dificultad": int(dificultad)}
        tareas.append(tarea)

    return integrantes, tareas


def calcular_carga_meta():
    pass


def repartir_tareas():
    pass


def mostrar_resumen():
    pass


# Programa principal
integrantes, tareas = ingresar_datos()

# Prueba para comprobar que los datos se ingresaron bien
print("\nDatos ingresados correctamente.")

print("\nIntegrantes:")
for integrante in integrantes:
    print("-", integrante)

print("\nTareas:")
for tarea in tareas:
    print("-", tarea["nombre"], "(" + str(tarea["dificultad"]) + ")")
