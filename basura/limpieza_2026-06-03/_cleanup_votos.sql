begin;

delete from votos;

delete from tema_sugerencias;

delete from temas;

select (select count(*) from votos) as votos_despues,
       (select count(*) from temas) as temas_despues,
       (select count(*) from tema_sugerencias) as sugerencias_despues;

commit;
