let pagina = 1;
let peliculas = "";
let ultimaPelicula;
const apiKey = "7cec2cb15b2ce01c602ff01e46c7d097";
let isSearching = false; // Añade esta variable para controlar si estás buscando

// Create Intersection Observer for lazy loading
let observador = new IntersectionObserver((entradas, observador) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting && !isSearching) { // Solo carga más si no estás buscando
            pagina++;
            cargarPeliculas();
        }
    });
}, {
    rootMargin: '0px 0px 200px 0px',
    threshold: 1.0
});

// Function to load movies
const cargarPeliculas = async (searchQuery = "") => {
    try {
        let url;
        if (searchQuery) {
            url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&page=${pagina}&query=${searchQuery}`;
            isSearching = true; // Estás buscando, así que no cargues más películas populares
        } else {
            url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${pagina}`;
            isSearching = false; // No estás buscando, así que puedes cargar películas populares
        }

        const respuesta = await fetch(url);

        if (respuesta.status === 200) {
            const datos = await respuesta.json();

            if (searchQuery) {
                peliculas = ""; // Limpia las películas anteriores si estás buscando
            }

            datos.results.forEach(pelicula => {
                peliculas += `
                <div class="pelicula" onclick="irAPaginaPelicula(${pelicula.id})">
                    <img class="poster" src="${pelicula.poster_path ? 'https://image.tmdb.org/t/p/w500/' + pelicula.poster_path : 'Images/no-image.png'}" alt="${pelicula.title}">
                    <h3 class="titulo">${pelicula.title}</h3>
                </div>
                `;
            });

            document.getElementById('contenedor').innerHTML = peliculas;

            if (pagina < 1000 && !isSearching) {
                if (ultimaPelicula) {
                    observador.unobserve(ultimaPelicula);
                }

                const peliculaEnPantalla = document.querySelectorAll('.contenedor .pelicula');
                ultimaPelicula = peliculaEnPantalla[peliculaEnPantalla.length - 1];
                observador.observe(ultimaPelicula);
            }
        } else {
            console.error("Error fetching data");
        }
    } catch (error) {
        console.error(error);
    }
};

// Initial load of popular movies
cargarPeliculas();

//Fuction to go to movie page
function irAPaginaPelicula(id){


    const urlPelicula=`https://www.themoviedb.org/movie/${id}`;

    window.open(urlPelicula,'_blank');
}

// Función para obtener una película aleatoria
async function obtenerPeliculaAleatoria() {
    try {
        // Obtenemos un número de página aleatorio (TMDB tiene miles de páginas)
        const paginaAleatoria = Math.floor(Math.random() * 500) + 1;
        
        // Hacemos la petición a la API para obtener películas populares de esa página
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${paginaAleatoria}`;
        const respuesta = await fetch(url);
        
        if (respuesta.status === 200) {
            const datos = await respuesta.json();
            
            // Si hay resultados, escogemos una película aleatoria de la página
            if (datos.results && datos.results.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * datos.results.length);
                const peliculaAleatoria = datos.results[indiceAleatorio];
                
                // Abrimos un modal o diálogo con la información de la película
                mostrarModalPeliculaAleatoria(peliculaAleatoria);
            } else {
                console.error("No se encontraron películas");
                alert("No se pudo encontrar una película aleatoria. Inténtalo de nuevo.");
            }
        } else {
            console.error("Error al obtener película aleatoria");
            alert("Hubo un error al buscar una película aleatoria. Inténtalo de nuevo.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error. Por favor inténtalo de nuevo más tarde.");
    }
}

// Función para mostrar el modal con la película aleatoria
function mostrarModalPeliculaAleatoria(pelicula) {
    // Creamos el contenedor del modal
    const modal = document.createElement('div');
    modal.className = 'modal-pelicula';
    
    // Calcular año de lanzamiento
    const fechaLanzamiento = pelicula.release_date ? new Date(pelicula.release_date).getFullYear() : 'Desconocido';
    
    // Construimos el HTML del modal
    modal.innerHTML = `
        <div class="modal-contenido">
            <span class="cerrar-modal">&times;</span>
            <div class="modal-header">
                <h2>¡Película Aleatoria Sugerida!</h2>
            </div>
            <div class="modal-body">
                <div class="pelicula-info">
                    <img class="poster-modal" src="${pelicula.poster_path ? 'https://image.tmdb.org/t/p/w500/' + pelicula.poster_path : 'Images/no-image.png'}" alt="${pelicula.title}">
                    <div class="detalles-pelicula">
                        <h3>${pelicula.title} <span class="ano-pelicula">(${fechaLanzamiento})</span></h3>
                        <div class="calificacion">
                            <span class="estrellas">★</span> ${pelicula.vote_average.toFixed(1)}/10
                        </div>
                        <p class="sinopsis">${pelicula.overview || 'No hay sinopsis disponible.'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-ver-detalles" onclick="irAPaginaPelicula(${pelicula.id})">Ver detalles</button>
                <button class="btn-otra-pelicula" onclick="obtenerPeliculaAleatoria()">Otra película</button>
            </div>
        </div>
    `;
    
    // Agregamos el modal al body
    document.body.appendChild(modal);
    
    // Mostramos el modal con una animación
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Funcionalidad para cerrar el modal
    const cerrarBtn = modal.querySelector('.cerrar-modal');
    cerrarBtn.addEventListener('click', () => {
        cerrarModal(modal);
    });
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarModal(modal);
        }
    });
    
    // Cerrar con la tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal(modal);
        }
    });
}

// Función para cerrar el modal
function cerrarModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 300); // Esperamos a que termine la animación
}

// Add event listener for search form
const searchForm = document.querySelector('.search-bar');
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchQuery = event.target.querySelector('input[name="q"]').value.trim();
    if (searchQuery) {
        pagina = 1;  // Reiniciar la página para empezar desde el principio
        peliculas = "";  // Vaciar la variable de HTML
        document.getElementById('contenedor').innerHTML = "";  // Limpiar el contenedor visual
        cargarPeliculas(searchQuery);  // Cargar las películas con el término de búsqueda
    }
});