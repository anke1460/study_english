require 'rubygems'
require 'sinatra'
require 'json'

# do nothing for now, we're just serving static content
# TODO automatically build the manifest file
gem 'activerecord','2.3.8'
require 'active_record'

ActiveRecord::Base.establish_connection(
        :adapter  => "postgresql",
           :host     => "localhost",
           :username => "root",
           :password => "root",
           :database => "study_language"
)
get '/' do
  #f=File.new('/home/zuoyonghui/projects/sencha/study_language/GRE-Deck.txt','r')

  #f.each_line do |line|
   # Word.create(:english =>line.split("\t")[0],:chinese=>line.split("\t")[1].split("\n")[0])
  #end
  redirect '/index.html'
  #erb :index
end

get '/words' do
  content_type :json
  Word.find_by_sql(["select * from words order by english  offset ? limit ? ", params[:start], params[:limit]]).to_json

end

get '/loads' do
  content_type :json
  p "-------------"
  Word.all[7000,1000].to_json
end

get '/db_dash_panel' do
  erb :db_dash_panel
end

class Word < ActiveRecord::Base

end
