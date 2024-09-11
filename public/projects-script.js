document.addEventListener('DOMContentLoaded', function() {
    const techButtons = document.querySelectorAll('.tech-btn');
    const projects = document.querySelectorAll('.project');
    let activeFilters = new Set();

    techButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tech = this.textContent.trim();
            console.log('Clicked tech:', tech);
            
            if (tech === 'All') {
                activeFilters.clear();
                techButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            } else {
                document.querySelector('.tech-btn:first-child').classList.remove('active');
                this.classList.toggle('active');
                
                if (activeFilters.has(tech)) {
                    activeFilters.delete(tech);
                } else {
                    activeFilters.add(tech);
                }
            }
            
            console.log('Active filters:', Array.from(activeFilters));
            filterProjects();
        });
    });

    function filterProjects() {
        projects.forEach(project => {
            const projectTechs = Array.from(project.querySelectorAll('.tag')).map(tag => tag.textContent.trim());
            console.log('Project techs:', projectTechs);
            
            if (activeFilters.size === 0 || projectTechs.some(tech => activeFilters.has(tech))) {
                project.style.display = '';
                console.log('Showing project:', project.querySelector('h3').textContent);
            } else {
                project.style.display = 'none';
                console.log('Hiding project:', project.querySelector('h3').textContent);
            }
        });
    }
});