# PORTADOR DE LUZ — Biblia Narrativa

> Documento vivo. Define el alma del juego: el mundo, el misterio, los personajes y
> —sobre todo— **el final**. Todo lo demás (mecánicas, arte, niveles) sirve a esto.

---

## 1. Logline

Un portador desciende por un abismo infinito cargando la última brasa del mundo para
reencender el Sol muerto. Cuanto mejor juega, más profundo llega... y más se acerca a
la única verdad que el mundo le ocultó: **que reencender el Sol es la peor cosa que
podría hacer.**

---

## 2. El gancho — por qué causa furor

La mayoría de los juegos te dan un objetivo y te recompensan por cumplirlo. Este te da
un objetivo, te entrena para desearlo con todas tus fuerzas durante horas... **y en el
final te revela que el objetivo era el horror, y que cada cosa "buena" que hiciste lo
empeoró.**

Es la sensación de *Spec Ops: The Line* o el final E de *Nier*, pero **tejida en la
mecánica de un roguelike**: el propio acto de jugar bien, de optimizar, de "progresar",
es lo que te vuelve cómplice. El juego no te juzga con un cartel. Te lo hace *sentir*.

**La moral está invertida y el jugador no lo sabe hasta el final.**

---

## 3. La regla que une todo: la luz

Todo en el juego es **la misma sustancia**: la luz.
- **Luz = vida.** Tu llama es tu salud. Si se apaga, morís.
- **Luz = visión.** Cuanta menos te queda, menos ves; el mundo se cierra.
- **Luz = arma.** Las criaturas de la sombra le temen.
- **Luz = memoria.** Lo que iluminás, lo recordás. La historia vive en lo oscuro.
- **Luz = la moneda del horror.** (Ver sección 7.)

---

## 4. La superficie — lo que el jugador cree

El **Sol** —al que llaman *el Hogar*— se apagó. Arriba reina una noche helada eterna.
Un puñado de sobrevivientes se acurruca alrededor del último fuego, en el borde del
**Abismo**: una grieta sin fondo que baja hacia el corazón del mundo.

Vos sos un **Portador**: el elegido para descender con la última brasa, llegar al núcleo
del Hogar y reencenderlo. Cada vez que morís, despertás de nuevo arriba, con la brasa
otra vez encendida, y volvés a bajar. Los sobrevivientes te despiden, recuerdan tus
intentos, reaccionan a cuán hondo llegaste. (Estructura tipo Hades: la muerte es parte
del relato, no un castigo.)

Eso es lo que te dicen. Eso es lo que creés. Por horas.

---

## 5. Las capas de la verdad (se revelan jugando)

La historia se cuenta en **capas que se pelan**, cada una recontextualizando la anterior.
El jugador las descubre por fragmentos: memorias que sueltan las Sombras al morir,
murales que solo se leen gastando luz, y los diálogos de arriba que cambian con el tiempo.

**Capa 1 — Las Sombras no son monstruos.**
Son Portadores anteriores. Fracasaron, se apagaron, y la oscuridad los reclamó. Cada una
que matás te da un destello de quién fue. *(Ya implementado en el prototipo.)*

**Capa 2 — Arriba ya no queda nadie.**
Las memorias revelan que el mundo de la superficie murió hace un tiempo inconcebible. Los
"sobrevivientes" que te despiden son ecos, recuerdos de gente que ya no existe. El fuego
alrededor del que se juntan... sos vos. Hace eras que descendés.

**Capa 3 — No hay nada que reencender abajo.**
No existe un Hogar apagado esperando tu brasa. Lo que hay en el fondo es algo vivo.

**Capa 4 — El Sol es una persona.** (Ver sección 6 y 8.)

---

## 6. Personajes

- **El Portador (vos).** Sin rostro, sin nombre al principio. Su identidad ES el misterio.
- **Los del Hogar.** Tres voces alrededor del último fuego que te despiden cada descenso:
  *la Vieja que recuerda*, *el Niño que pregunta*, *la que ya no habla*. Sus diálogos
  mutan a medida que entendés qué son.
- **La Primera.** La primera Portadora. Llegó al fondo hace una eternidad. Lo que encontró
  ahí abajo la convirtió en lo que ahora llamamos el Sol. Está al final. Está consciente.
  Está suplicando.
- **El Eco Rival (opcional).** Otra Portadora que baja en paralelo a vos en algunas runs;
  no sabés si ayudarla o temerle. Siembra el tema de "no sos el único / nunca lo fuiste".

---

## 7. La mecánica que ES el horror

A lo largo del juego, un medidor crece: los del Hogar lo llaman **"el avance para
reencender"**. Donar braseros, juntar luz, llegar hondo: todo lo sube. El juego te
entrena para maximizarlo. Se siente *bien*. Es tu progreso.

**La verdad (Capa final):** ese medidor no mide cuánto falta para reencender. Mide
**cuánta vida le diste de comer al núcleo agonizante.** Cada Portador que "fracasa" y se
vuelve Sombra es luz drenada hacia abajo para mantener vivo, un instante más, algo que
debería morir. El loop entero es una máquina que cosecha voluntarios para posponer un
final inevitable.

**Y la inversión moral:** *donar* tu luz (lo que el juego premia como generoso) alimenta
la agonía. *Guardarla* para ti, egoísta, llegar rápido al fondo — ese era el único camino
piadoso. El jugador que optimizó "el bien" fue el que más daño hizo. El juego nunca te lo
dijo. Te dejó hacerlo.

---

## 8. EL FINAL  ⚠️ SPOILERS — el corazón del proyecto

> Esto es la carga útil. Todo el diseño siembra este golpe.

En el fondo encontrás a **la Primera**: el Sol. No es un astro, es una mujer hecha de luz,
clavada al núcleo, en agonía, mantenida con vida contra su voluntad por cada muerte de
arriba — incluidas todas tus runs. Ella no quiere que la reenciendas. Te pide que la dejes
**apagarse**.

Y entonces entendés qué son las Sombras de verdad. No eran cosas que mueren. Eran lo que
intenta **nacer**. El viejo Sol acaparó toda la existencia; mientras él arda, nada nuevo
puede venir al mundo. Las Sombras —las criaturas que cazaste toda la partida— eran el
mundo siguiente tratando de empezar. Y vos las masacraste, una por una, creyéndote héroe.

**Las decisiones / finales:**

- **REENCENDER** (el final que todos querían — el falso bueno):
  Volcás toda tu luz y cada memoria que juntaste en el núcleo. El Sol vuelve a arder. Sube
  un calor familiar, reconfortante. Parece victoria... y la cámara sube, sube, hasta la
  superficie, donde **un nuevo Portador recibe la brasa y empieza a descender.** Condenaste
  al ciclo a seguir. Y la última imagen sos vos, ahora clavada al núcleo, ardiendo, lúcida,
  para siempre. La "victoria" cálida era tu condena.

- **DEJARLA APAGAR** (el final verdadero — agridulce, demoledor):
  Elegís dejar que el Sol se apague. Todo a negro. Silencio absoluto. Y en la oscuridad
  total, empezás a escuchar... vida. Porque la oscuridad nunca fue el enemigo. A medida que
  la última luz muere, la pantalla no se llena de muerte sino de **miles de ojos abriéndose
  en lo oscuro** — un amanecer de otra clase. Sacrificaste la luz conocida del mundo para
  que una verdadera pudiera, por fin, empezar. Cada Sombra que mataste pesa. Y la elección
  correcta era, siempre, soltar.

- **ROMPER EL CICLO** (final secreto, ligado a la meta-mecánica):
  Reservado. Se desbloquea entendiendo que tus runs quedan grabadas. Tema: perdonarte por
  todo lo que cazaste sin saber.

---

## 9. Temas

El progreso como trampa. La diferencia entre lo que nos *dicen* que es heroico y lo que
*es*. El miedo a la oscuridad/al cambio/al fin como el verdadero villano. Soltar como el
acto más valiente. Lo cómplice que te volvés cuando "solo seguís las reglas y jugás bien".

---

## 10. Cómo cada mecánica del prototipo ahora SIGNIFICA algo

| Mecánica | Antes era... | Ahora significa... |
|----------|--------------|---------------------|
| Luz que drena | tensión de supervivencia | tu vida finita gastándose en una mentira |
| Sombras que cazás | enemigos | el futuro que estás asesinando |
| Memorias al matarlas | lore suelto | las vidas que borrás para "avanzar" |
| Braseros: donar vs guardar | economía moral | la inversión moral central del final |
| Descender más hondo | dificultad | acercarte a la verdad que no querías saber |
| Morir y reaparecer | reintentar | la prueba de que arriba ya nadie queda |

Nada se tira. Todo lo que prototipamos se vuelve carga narrativa.

---

## 11. Para decidir juntos
- **Cuán oscuro dejamos caer el final** (demoledor puro / agridulce con luz de esperanza).
- Si incluimos el **Eco Rival** desde el inicio o lo guardamos.
- El nombre definitivo (¿"Portador de Luz" o algo más filoso?).
