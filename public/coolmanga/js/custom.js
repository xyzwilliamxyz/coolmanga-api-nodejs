$(document).ready(function(){
    
    
    
    $('.parallax').parallax();
    $('.materialboxed').materialbox();  
    
    //$('.scrollspy').scrollSpy();
    
    
    
    $('#menu-bar a').click(function(){
        
        
        $('html, body').animate({
            scrollTop: $( $.attr(this, 'href') ).offset().top
        }, 500);
        
        return false;
    });
    
    $('body').scrollspy({ target: '#menu-bar' });
    
    var options = [{selector: '#left-list', offset: 50, callback: function() {
                        Materialize.showStaggeredList('#left-list');
                    }
                  },
                   {selector: '#right-list', offset: 50, callback: function() {
                        Materialize.showStaggeredList('#right-list');
                    }
                  },
                   {selector: '#feature-device', offset: 50, callback: function() {
                        Materialize.fadeInImage('#feature-device');
                       
                        setTimeout(function() {
                            $('#feature-device').addClass("materialboxed");
                            $('.materialboxed').materialbox();  
                            
                        }, 1000);
                        
                    }
                  }
                  
    ];
    
    Materialize.scrollFire(options);
    
    
    Materialize.fadeInImage('#sm-top-container img');
                       
    setTimeout(function() {
        $('#sm-top-container img').addClass("materialboxed");
        $('.materialboxed').materialbox();  

    }, 1000);
});