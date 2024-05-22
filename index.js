/*
créer un jeux de brick breaker
28/04/2024/ pierre arthur
la création va se faire avec canvas.
*/

//déclarer les variable néccesaire
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

let balles = [];                                                // Tableau pour stocker les balles
let niveau = 1;                                                 // niveau auquel nous somme actuellement niv=50 alors nombre de ball=50 poids bricsmax=50
let width = 600;                                                //largeur
let height = 600;                                               //hauteur
let canonX = 300;                                               //position de la base du canon en x
let canonY = 550;                                               //position de la base du canon en y
let canonLength = 50;                                           //taille du canon
let angle = 0;                                                  //angle de départ
var audioContext = new (window.AudioContext || window.webkitAudioContext)();// Créer un contexte audio
var T = [ [],[],[],[],[],[],[],[],[] ];                         //contient les coordonées de chaque rectangle.
var Tcoli = [ [],[],[],[],[],[],[],[],[] ];                     //contient les coordonées de chaque rectangle.


//déclarer les fonctions
//-----------------------------------------------------------------------------------------------------------------------------------------------------------
//gérer le son
function jouerSon() {
    // Créer une source d'oscillateur
    var oscillateur = audioContext.createOscillator();
    oscillateur.type = 'square'; // Type d'onde sonore
    oscillateur.frequency.setValueAtTime(440, audioContext.currentTime); // Fréquence en hertz (La note "A")

    // Créer un gain pour contrôler le volume
    var gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume

    // Connecter l'oscillateur au gain, puis au contexte audio
    oscillateur.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Démarrer l'oscillateur et l'arrêter après un court instant
    oscillateur.start();
    oscillateur.stop(audioContext.currentTime + 0.1); // Jouer le son pour 100 millisecondes
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------

function creer_rect(x, y, width, height, niv){                       //pour créer un rectangle
    context.fillRect(x, y, width, height);
    context.fillStyle = "white";
    context.fillText(String(niv), x+15, y+20);
    context.fillStyle = "black";
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------


function creer_tab(nbrRectangles, ligne){                       //créer un tableau T avec nbrrectangles case. chaque case contenant un nombre compris entre 1 et nbrRectangles.
    T[ligne] = [];
    for (let i = 0; i < nbrRectangles; i++) {

        colone = Math.round(Math.random() * 8);

        if ( T[ligne].indexOf({colone: colone}) == -1 ){
    
            T[ligne][i] = {colone: colone, niv: niveau};
            
        }else{
            i-- ;
        }

    }

}

function creer_lign(ligne, T){
    var nbrRectangles = 8 * Math.random();                      // Nombre de rectangles compris entre 1 et 8
    const largeurRect = 63;                                     // Largeur d'un rectangle
    const hauteurRect = 40;                                     // Hauteur d'un rectangle
    const espacement = 3;                                       // Espacement entre les rectangles
    let posY = 3 * ( ligne + 1 ) + 40 * ligne + 60 ;            // Position verticale de la ligne de rectangles
    Tcoli[ligne] = [];

    if( ligne == 0 ){
        creer_tab(nbrRectangles, ligne);
    }

    for (let i = 0; i < T[ligne].length; i++) {
        // Calculer la position x du rectangle en cours
        let posX = Math.round(T[ligne][i].colone) * (largeurRect + espacement) + 3;
        // Dessiner le rectangle
        niv = T[ligne][i].niv ;
        Tcoli[ligne][i] = {x: posX, y: posY, width: largeurRect, height: hauteurRect, niv: niv };
        creer_rect(posX, posY, largeurRect, hauteurRect, Tcoli[ligne][i].niv)
    }
}

function modif_block(ligne, col){
    const espacement = 3;                                       // Espacement entre les rectangles
    const largeurRect = 63;                                     // Largeur d'un rectangle
    const hauteurRect = 40;                                     // Hauteur d'un rectangle
    let posY = 3 * ( ligne + 1 ) + 40 * ligne + 60 ;            // Position verticale de la ligne de rectangles
    let posX = Math.round(T[ligne][col].colone) * (largeurRect + espacement) + 3;
    // Dessiner le rectangle
    niv = T[ligne][col].niv ;
    if(niv <= 0){
        Tcoli[ligne].splice(col, 1);
        T[ligne].splice(col, 1);
        context.clearRect(posX, posY, largeurRect, hauteurRect);

    }else{
        Tcoli[ligne][col] = {x: posX, y: posY, width: largeurRect, height: hauteurRect, niv: niv };
        creer_rect(posX, posY, largeurRect, hauteurRect, Tcoli[ligne][col].niv);
    }
}

function ajouter_lign(){                                        //faire décsendre toute les ligne précédente et créer une nouvelle
    niveau++;
    context.clearRect(0, 0, width, height-100);

    if(T[8] != 0){
        gamover = true;
        alert("Game over");
        document.write("<center><h1>SCORE : "+niveau+"<h1></center>");
    }

    for ( i = T.length-1 ; i > 0 ; i-- ){
        if( T[i-1] != []){
            T[i] = T[i-1];
            creer_lign(i, T);
        }
    }

    creer_lign(0,T);
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------

function detecterCollision(balle, rect) {
    i = 5;
    // Vérifier si la balle est à l'intérieur des limites horizontales du rectangle
    let collisionHorizontale = balle.x + balle.radius+i >= rect.x && balle.x - balle.radius-i <= rect.x + rect.width;
    // Vérifier si la balle est à l'intérieur des limites verticales du rectangle
    let collisionVerticale = balle.y + balle.radius+i >= rect.y && balle.y - balle.radius-i <= rect.y + rect.height;
    

    return collisionHorizontale && collisionVerticale 
}

// Fonction pour détecter la collision avec les parois du canvas
function detecterCollisionAvecParois(balle) {
    if (balle.x - balle.radius < 0 || balle.x + balle.radius > canvas.width) {
        // La balle a touché la paroi gauche ou droite
        balle.dx *= -1; // Inverser la composante horizontale de la vitesse
        jouerSon()
    }
    if (balle.y - balle.radius < 0) {

        // La balle a touché la paroi supérieure
        balle.dy *= -1; // Inverser la composante verticale de la vitesse
        jouerSon();
    }
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------

function dessin_canon(){                                        //pour déssiner le canon. ce sera un cercle et un rectangle.

    context.clearRect(50, 499, width, height);
    context.save();

    //position de notre dessin
    context.translate(canonX, canonY);
    context.rotate(angle);
    
    //dessin du rectangle
    context.beginPath();
    context.rect(-10, -canonLength, 20, canonLength);
    context.fillStyle = 'black';
    context.fill();

    //dessin du cercle
    context.beginPath();                                        //commence un nouveau dessin a partir de nos nouvelle coordoné canonX et canon Y
    context.arc(0, 0, 15, 0, 2 * Math.PI);                      //cree un cercle
    context.fillStyle = 'grey';                                 //choisi une couleur
    context.fill();                                             //affiche cette couleur.

    context.restore();
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------

canvas.addEventListener('mousemove', function(event) {          //pour bouger le canon quand la souris bouge.
    var rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left,
        mouseY = event.clientY - rect.top,
        dx = mouseX - canonX,
        dy = mouseY - canonY,
        angle = Math.atan2(dy, dx) + Math.PI / 2,
    dessin_canon();
})

//-----------------------------------------------------------------------------------------------------------------------------------------------------------
// Fonction pour créer une balle

function creerBalle() {
    let balle = {
        x: canonX,
        y: canonY,
        radius: 5,                                              // Rayon de la balle
        dx: Math.cos(angle_balle - Math.PI / 2) * 5,                  // Vitesse en x
        dy: Math.sin(angle_balle - Math.PI / 2) * 5                   // Vitesse en y
    };
    balles.push(balle);
}

// Fonction pour mettre à jour et dessiner les balles
function updateBalles() {
    balles.forEach(function(balle, index) {
        // Effacer seulement le carré autour de la balle
        let xCote = balle.x - balle.radius;
        let yCote = balle.y - balle.radius;
        let diametre = balle.radius * 2 + 2 ;
        context.clearRect(xCote - 1 , yCote - 1 , diametre , diametre );

        // Mettre à jour la position de la balle
        balle.x += balle.dx;
        balle.y += balle.dy;

        //détecter collision avec toute les cases
        colision = false;
        for(lign = 0; lign < Tcoli.length; lign++){
            for(col = 0; col < Tcoli[lign].length; col++){
                if (detecterCollision(balle, Tcoli[lign][col])) {
                    jouerSon();
                    calculerRebond(balle, Tcoli[lign][col])
                    T[lign][col].niv--;
                    modif_block(lign, col);
                    break;
                }
            }
        }
        //rebondir sur les parois du canvas
        detecterCollisionAvecParois(balle);


        // Dessiner la balle
        context.beginPath();
        context.arc(balle.x, balle.y, balle.radius, 0, Math.PI * 2);
        context.fillStyle = 'red';
        context.fill();

        // Supprimer les balles qui sortent du canvas par le bas
        if (balle.y >= canvas.height ) {
            balles.splice(index, 1);
            if ( balles == 0 ){ 
                ajouter_lign() ;
            }
        }
    });

}

// Écouteur d'événements pour créer une balle lorsque l'utilisateur clique
canvas.addEventListener('click', function() {
    if(balles == 0){
        let nombreDeBalles = 0;
        angle_balle = angle;
        let intervalle = setInterval(function() {
            if (nombreDeBalles >= niveau) {
                clearInterval(intervalle); // Arrêter l'intervalle après niveau balles
            } else {
                creerBalle();
                nombreDeBalles++;
            }
        }, 100); // 100 millisecondes entre chaque balle
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------------------------------

function calculerRebond(balle, rect) {
    // Déterminer le côté du rectangle touché
    let coteTouche;
    let i = 5;
    if (balle.y - balle.radius + i<= rect.y || balle.y + balle.radius - i >= rect.y + rect.height) {
        // La balle a touché le haut ou le bas du rectangle
        coteTouche = 'vertical';
    } else {
        // La balle a touché les côtés gauche ou droit du rectangle
        coteTouche = 'horizontal';
    }

    // Appliquer la loi de la réflexion
    if (coteTouche === 'vertical') {
        // Inverser la composante verticale de la vitesse
        balle.dy *= -1;
    } else {
        // Inverser la composante horizontale de la vitesse
        balle.dx *= -1;
    }

}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------

window.onload = function() {

    dessin_canon();
    creer_lign(0,T);
    gameLoop();

}

// Boucle de jeu pour mettre à jour les balles
function gameLoop() {
    requestAnimationFrame(gameLoop);
    updateBalles();
}
