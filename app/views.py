from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.views import generic
from .forms import LoginForm
from .forms import SignupForm

class HomepageView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/home.html"
		return ( context )

class LoginView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/login.html"
		context["form"] = LoginForm()
		return ( context )

class SignupView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/signup.html"
		context["form"] = SignupForm()
		return ( context )

#@login_required
class ProfileView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/profile.html"
		return ( context )