$(function() {

    
    var WordFrequency = {
    
        excluded: [],
        joins: [],
        groups: [],
        frequencies: [],
        linesPerCicle: 50,
        currentCicle: 0,
        string: '',
        caseSensitive: false,
        ignorePunctuation: true,
        timeOut: false,
        tableResult: false,
        
        init: function() {
            this.tableResult = $('#table-results').dataTable({
				"dom": 'Tlfrtip',
				"tableTools": {
					"sSwfPath": "vendor/DataTables/swf/copy_csv_xls.swf",
					"aButtons": [{
						"sExtends": "collection",
						"sButtonText": "Download",
						"aButtons": [ "copy", "csv", "xls" ]
					}] 
				},
				"fnCreatedRow": function( nRow, aData, iDataIndex ) {
					$('td:eq(0)', nRow).prepend('<a class="btn btn-danger btn-xs remove-word" data-index="'+iDataIndex+'" data-word="'+aData[0]+'"><span class="glyphicon glyphicon-remove"></span></a>');
				},
				
            });
            
            var w = this;
            
            $('#processing').modal({
				keyboard: false,
				show: false,
				backdrop: 'static'
			});
			
			$('#about').modal({
				show: false,
			});
			
			$('#button-about').click(function() {
				$('#about').modal('show');
			});
			
            $('#option-case-sensitive').click(function() {
				w.caseSensitive = $(this).is(':checked');
			});
			
			$('#option-ignore-punctuation').click(function() {
				w.ignorePunctuation = $(this).is(':checked');
			});
            
            $('#table-results').on('click', '.remove-word', function() {
				var word = $(this).data('word');
				var index = $(this).data('index');
				
				if ($('#excluded_input').val() != '')
					word = "\n" + word;
				$('#excluded_input').val( $('#excluded_input').val() + word );
				
				w.tableResult.dataTable().api().row( $(this).parents('tr') ).remove().draw( false );
			});
            
            $('#submit_count').click(function() {
				$(this).addClass('disabled');
				$('#processing').modal('show');
				
				//reset count
				w.frequencies = [];
				w.currentCicle = 0;
				w.renderProgress(0,1);
				$('#processing-current-word').html('');
				
				//Start Process
				
				//preProcess
				if (!w.caseSensitive) {
					w.string = $('#string_input').val().toLowerCase();
					w.excluded = $('#excluded_input').val().toLowerCase().split("\n");
					w.joins = $('#joins_input').val().toLowerCase().split("\n");
				} else {
					w.string = $('#string_input').val();
					w.excluded = $('#excluded_input').val().split("\n");
					w.joins = $('#joins_input').val().split("\n");
				}
				
				if (w.ignorePunctuation) {
					//w.string = w.string.replace(/\[\.,-\/\!%\*;:\{\}=\-_`~\(\)\]/g,'');
					w.string = w.string.replace(/[\.\[\],-\/!\^&\*;:{}=\-_`~()]/g,"");
				}
				
				w.timeOut = setTimeout( function() { w.process(); }, 50);
				
				
				
				return true;

            });
            
            $('#cancel-count').click(function() {
				clearTimeout(w.timeOut);
				$('#processing').modal('hide');
				$('#submit_count').removeClass('disabled');
			});
            
        },
        
        process: function() {
			this.countAndDeleteJoins(); //must execute before countWords
				
			//process
			this.countWords();
		},

        renderTable: function() {
			//console.log(this.frequencies);
			var table = new Array();
			
			for (words in this.frequencies) {
				table.push([words, this.frequencies[words]]);
			}
			
			if (table.length > 0) {
				this.tableResult.dataTable().fnClearTable();
				this.tableResult.dataTable().fnAddData(table);
				$('#table-results_wrapper').show();
				$('#initial-text').hide();
			} else {
				$('#table-results_wrapper').hide();
				$('#initial-text').show();
			}
			
			
			
		},
        
        countAndDeleteJoins: function() {
			
			$('#processing-label').html('Processing sentences...');
			
			// find, count and exclude the joins
            for( l=0; l<this.joins.length; l++ ) {
                if (this.joins[l].length > 0) {
                    regexp = new RegExp(this.joins[l], 'g');
                    this.frequencies[this.joins[l]] = (this.string.match(regexp) || []).length;
                    this.string = this.string.replace(regexp, '');
                }
                this.renderProgress(l, this.joins.length);
            }
            
		
		},
        
        countWords: function() {
            //var cleanString = string.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,""),
            var lines,
                words,
                //frequencies = [],
                word, frequency, i, l, regexp;

            //console.log(this.currentCicle);
            
            this.renderProgress(0,1);
            $('#processing-label').html('Counting words...');
            
            lines = this.string.split("\n");
            
            var startCicle = this.currentCicle * this.linesPerCicle;
            var endCicle = this.currentCicle * this.linesPerCicle + this.linesPerCicle;
            var end = false;
            if (endCicle > lines.length) {
				endCicle = lines.length;
				end = true;
			}
            
            for( l=startCicle; l<endCicle; l++ ) {
                words = lines[l].split(' ');
                for( i=0; i<words.length; i++ ) {
                    word = words[i];
                    if (word.length > 0) {
                        
                        if (typeof(this.frequencies[word]) != 'number')
							this.frequencies[word] = 0;
                        
                        this.frequencies[word]++;
                        $('#processing-current-word').html(word);
                    }
                    
                }
                
                this.renderProgress(l, lines.length);
                
            }
            
            if (!end) {
			
				this.currentCicle ++;
				var _this = this;
				this.timeOut = setTimeout( function() { _this.countWords(); }, 1);
			
			} else {
			
				//remove excluded words
				for( l=0; l<this.excluded.length; l++ ) {
					if (this.excluded[l].length > 0) {
						//console.log(this.excluded[l]);
						delete this.frequencies[this.excluded[l]];
					}
				}
				
				this.renderTable();
				$('#processing').modal('hide');
				$('#submit_count').removeClass('disabled');
				
			}
            
            
            
            
            //words = Object.keys( frequencies );
            return true;
            //return this.frequencies;
            //return words.sort(function (a,b) { return frequencies[b] -frequencies[a];}).slice(0,cutOff).toString();
        
        },
        
        renderProgress: function(current, total) {
		
			var perce = parseInt( (current/total) * 100 );
			$('#progressbar').css('width', perce+'%').attr('aria-valuenow', perce);
		
		}
    
        
    
    };
    
    WordFrequency.init();
    
    


});

