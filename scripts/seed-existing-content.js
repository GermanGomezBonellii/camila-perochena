/* Seeds only data already displayed by the final public site. Safe to run repeatedly. */
const { q } = require('../lib/db');

const books = [{
  title: 'Cristina y la Historia', year: 2022, publisher: 'Crítica',
  description_es: 'Basado en su tesis doctoral, el libro estudia cómo Cristina Fernández de Kirchner utilizó distintas interpretaciones del pasado para construir identidad política, legitimar su gobierno y estructurar sus conflictos con la oposición.',
  description_en: 'Drawing on her doctoral dissertation, the book examines how Cristina Fernández de Kirchner used different interpretations of the past to build political identity, legitimize her government and frame her conflicts with the opposition.',
  cover_path: '/img/cristina_y_la_historia.jpg', external_url: null, published: 1, featured_home: 1, sort_order: 0
}];
const videos = [
  ['JNojE_R6ULk','¿Fue Argentina alguna vez una potencia mundial?'],
  ['Ld1j95u4Hkw','El mito de la Argentina blanca (segunda parte)'],
  ['ryzW38Xp9ok','Las nuevas derechas y el debate sobre el fascismo'],
  ['laJcDeqxzOQ','Una historia de las vacaciones'],
  ['fZtWPkzHKII','Elecciones legislativas y su incidencia en la gobernabilidad'],
  ['brvUhyoNTbU','La Argentina y una historia de cepos cambiarios']
];
for (const book of books) {
  if (!q('SELECT id FROM books WHERE title=? AND year=?').get(book.title, book.year)) q('INSERT INTO books(title,year,publisher,description_es,description_en,cover_path,external_url,published,featured_home,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?)').run(book.title,book.year,book.publisher,book.description_es,book.description_en,book.cover_path,book.external_url,book.published,book.featured_home,book.sort_order);
}
for (const [index, video] of videos.entries()) {
  if (!q('SELECT id FROM media_videos WHERE youtube_id=?').get(video[0])) q('INSERT INTO media_videos(youtube_id,title,published_at,thumbnail,url,program,published,sort_order) VALUES(?,?,?,?,?,?,?,?)').run(video[0],video[1],null,`https://i.ytimg.com/vi/${video[0]}/hqdefault.jpg`,`https://www.youtube.com/watch?v=${video[0]}`,'Odisea Argentina',1,index);
}
console.log('Existing public books and Odisea videos are present in the CMS.');
